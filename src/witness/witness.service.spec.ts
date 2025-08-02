import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { checkFbiApiList } from './utils/fbiList.utils'
import { getCountryFromIp } from './utils/findCountryByIp.utils'
import {
  getCountryFromPhone,
  validatePhoneNumber,
} from './utils/phoneValidation.utisl'
import { saveReport } from './utils/saveReport.utils'
import { WitnessService } from './witness.service'

jest.mock('./utils/phoneValidation.utisl', () => ({
  validatePhoneNumber: jest.fn(),
  getCountryFromPhone: jest.fn(),
}))
jest.mock('./utils/fbiList.utils', () => ({
  checkFbiApiList: jest.fn(),
}))
jest.mock('./utils/findCountryByIp.utils', () => ({
  getCountryFromIp: jest.fn(),
}))
jest.mock('./utils/saveReport.utils', () => ({
  saveReport: jest.fn(),
}))

describe('WitnessService', () => {
  let service: WitnessService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WitnessService],
    }).compile()

    service = module.get<WitnessService>(WitnessService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should throw if phone number is invalid', async () => {
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(false)

    await expect(
      service.saveAndGetReport('John Doe', 'invalid-phone', '127.0.0.1'),
    ).rejects.toThrow(BadRequestException)

    expect(checkFbiApiList).not.toHaveBeenCalled()
  })

  it('should throw if no matching FBI case is found', async () => {
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(true)
    ;(checkFbiApiList as jest.Mock).mockResolvedValue(false)

    await expect(
      service.saveAndGetReport('Unknown Person', '+1234567890', '127.0.0.1'),
    ).rejects.toThrow(BadRequestException)
  })

  it('should fallback to IP country if phone country is null', async () => {
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(true)
    ;(checkFbiApiList as jest.Mock).mockResolvedValue(true)
    ;(getCountryFromPhone as jest.Mock).mockReturnValue(null)
    ;(getCountryFromIp as jest.Mock).mockReturnValue('RS')

    const result = await service.saveAndGetReport(
      'John Doe',
      '+38160111222',
      '127.0.0.1',
    )

    expect(result).toHaveProperty('country', 'RS')
    expect(saveReport).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+38160111222' }),
    )
  })

  it('should return report with country from phone if available', async () => {
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(true)
    ;(checkFbiApiList as jest.Mock).mockResolvedValue(true)
    ;(getCountryFromPhone as jest.Mock).mockReturnValue('US')

    const report = await service.saveAndGetReport(
      'Jane Doe',
      '+12025550123',
      '::1',
    )

    expect(report).toMatchObject({
      personOrCase: 'Jane Doe',
      phone: '+12025550123',
      country: 'US',
      isValidCase: true,
    })

    expect(saveReport).toHaveBeenCalled()
  })
})
