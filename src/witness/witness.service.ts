import { BadRequestException, Injectable } from '@nestjs/common'
import { WitnessReport } from './interface/witnessReport.interface'
import { checkFbiApiList } from './utils/fbiList.utils'
import { getCountryFromIp } from './utils/findCountryByIp.utils'
import {
  getCountryFromPhone,
  validatePhoneNumber,
} from './utils/phoneValidation.utisl'
import { saveReport } from './utils/saveReport.utils'

@Injectable()
export class WitnessService {
  /**
   * Validates and saves a witness report based on the provided person/case, phone, and IP.
   *
   * @param personOrCase - Name of the person or part of the case title to check against FBI API
   * @param phone - Contact phone number provided by the witness
   * @param ip - IP address of the client submitting the report
   * @returns  WitnessReport
   * @throws BadRequestException if the phone number is invalid or no matching FBI case is found
   */
  async saveAndGetReport(
    personOrCase: string,
    phone: string,
    ipAddress: string,
  ): Promise<WitnessReport> {
    const isValidPhone = validatePhoneNumber(phone)
    if (!isValidPhone) {
      throw new BadRequestException('Invalid phone number')
    }

    const isValidCase = await checkFbiApiList(personOrCase)
    if (!isValidCase) {
      throw new BadRequestException('No matching case found in FBI database')
    }

    let country = getCountryFromPhone(phone)
    if (!country) {
      country = getCountryFromIp(ipAddress) ?? 'Unknown'
    }

    const report: WitnessReport = {
      personOrCase,
      phone,
      isValidCase: true,
      country,
      ipAddress,
      date: new Date().toLocaleDateString('sr-RS'),
    }

    await saveReport(report)

    return report
  }
}
