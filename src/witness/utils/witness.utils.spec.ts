import * as fs from 'fs/promises'
import * as path from 'path'

import axios from 'axios'
import * as geoip from 'geoip-lite'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import { WitnessReport } from '../interface/witnessReport.interface'
import { checkFbiApiList } from './fbiList.utils'
import { getCountryFromIp } from './findCountryByIp.utils'
import {
  getCountryFromPhone,
  parsePhone,
  validatePhoneNumber,
} from './phoneValidation.utisl'
import { saveReport } from './saveReport.utils'

jest.mock('axios')
jest.mock('libphonenumber-js')

const mockFilePath = path.join(path.resolve('reports'), 'reports.json')

let consoleErrorSpy: jest.SpyInstance

describe('Utility Functions', () => {
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  // Optional: simple sanity check that path.join exists
  describe('path module sanity check', () => {
    it('should have join function', () => {
      expect(typeof path.join).toBe('function')
    })
  })

  // --- FBI API -------------------------------------------------
  describe('checkFbiApiList', () => {
    it('should return true if API returns results with a match', async () => {
      ;(axios.get as jest.Mock).mockResolvedValueOnce({
        data: { items: [{ title: 'john' }], total: 1 },
      })
      const result = await checkFbiApiList('john')
      expect(result).toBe(true)
    })

    it('should return false if API returns no results', async () => {
      ;(axios.get as jest.Mock).mockResolvedValueOnce({
        data: { items: [], total: 1 },
      })
      const result = await checkFbiApiList('nobody')
      expect(result).toBe(false)
    })

    it('should return false if API throws an error', async () => {
      ;(axios.get as jest.Mock).mockRejectedValueOnce(new Error('API error'))
      const result = await checkFbiApiList('fail')
      expect(result).toBe(false)
    })
  })

  describe('parsePhone', () => {
    it('should return parsed phone object when valid', () => {
      const mockParsed = { isValid: () => true, country: 'US' }
      ;(parsePhoneNumberFromString as jest.Mock).mockReturnValue(mockParsed)

      const result = parsePhone('+1234567890')
      expect(result).toBe(mockParsed)
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('+1234567890')
    })

    it('should return undefined when parsing fails', () => {
      ;(parsePhoneNumberFromString as jest.Mock).mockReturnValue(undefined)

      const result = parsePhone('invalid')
      expect(result).toBeUndefined()
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('invalid')
    })
  })

  describe('validatePhoneNumber', () => {
    it('should return true for valid phone', () => {
      const mockParsed = { isValid: () => true }
      ;(parsePhoneNumberFromString as jest.Mock).mockReturnValue(mockParsed)

      expect(validatePhoneNumber('+1234567890')).toBe(true)
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('+1234567890')
    })

    it('should return false for invalid phone', () => {
      const mockParsed = { isValid: () => false }
      ;(parsePhoneNumberFromString as jest.Mock).mockReturnValue(mockParsed)

      expect(validatePhoneNumber('invalid')).toBe(false)
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('invalid')
    })

    it('should return false when parsing returns undefined', () => {
      ;(parsePhoneNumberFromString as jest.Mock).mockReturnValue(undefined)

      expect(validatePhoneNumber('')).toBe(false)
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('')
    })
  })

  describe('getCountryFromPhone', () => {
    it('should return country code when phone is valid', () => {
      const mockParsed = { country: 'GB' }
      ;(parsePhoneNumberFromString as jest.Mock).mockReturnValue(mockParsed)

      expect(getCountryFromPhone('+447911123456')).toBe('GB')
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('+447911123456')
    })

    it('should return null when phone parsing fails', () => {
      ;(parsePhoneNumberFromString as jest.Mock).mockReturnValue(undefined)

      expect(getCountryFromPhone('bad-number')).toBeNull()
      expect(parsePhoneNumberFromString).toHaveBeenCalledWith('bad-number')
    })
  })

  describe('getCountryFromIp', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return country code for valid IP', () => {
      jest
        .spyOn(geoip, 'lookup')
        .mockReturnValue({ country: 'US' } as geoip.Lookup)

      const result = getCountryFromIp('8.8.8.8')
      expect(result).toBe('US')
    })

    it('should return null for unknown IP', () => {
      jest.spyOn(geoip, 'lookup').mockReturnValue(null)

      const result = getCountryFromIp('0.0.0.0')
      expect(result).toBeNull()
    })
  })

  describe('saveReport', () => {
    const mockReport: WitnessReport = {
      personOrCase: 'Jane Doe',
      phone: '+1234567890',
      isValidCase: true,
      country: 'US',
      date: '31.07.2025',
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create the directory and write new report to file if file does not exist', async () => {
      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined)

      // Simulate file not existing
      const enoentError = new Error('File not found') as NodeJS.ErrnoException
      enoentError.code = 'ENOENT'
      jest.spyOn(fs, 'readFile').mockRejectedValueOnce(enoentError)

      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined)

      await saveReport(mockReport)

      expect(fs.mkdir).toHaveBeenCalledWith(path.resolve('reports'), {
        recursive: true,
      })

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockFilePath,
        JSON.stringify([mockReport], null, 2),
        'utf-8',
      )
    })

    it('should append to existing reports if file exists', async () => {
      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined)

      const existing: WitnessReport[] = [
        {
          personOrCase: 'John Smith',
          phone: '+38160000000',
          isValidCase: false,
          country: 'RS',
          date: '30.07.2025',
        },
      ]

      jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(existing))
      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined)

      await saveReport(mockReport)

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockFilePath,
        JSON.stringify([...existing, mockReport], null, 2),
        'utf-8',
      )
    })

    it('should log a warning if file content is invalid JSON', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined)
      jest.spyOn(fs, 'readFile').mockResolvedValue('{ invalid json }')
      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined)

      await saveReport(mockReport)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error reading or parsing existing reports:',
        expect.any(SyntaxError),
      )

      consoleSpy.mockRestore()
    })

    it('should log error if something fails during write', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined)
      jest.spyOn(fs, 'readFile').mockRejectedValue({ code: 'ENOENT' })
      jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Disk full'))

      await saveReport(mockReport)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save report:',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })
})
