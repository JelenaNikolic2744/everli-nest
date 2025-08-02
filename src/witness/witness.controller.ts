import { Body, Controller, Ip, Post } from '@nestjs/common'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { WitnessReportDto } from './dto/witnessReport.dto'
import { WitnessReport } from './interface/witnessReport.interface'
import { WitnessService } from './witness.service'

export interface ReportWithMessage {
  message: string
  report: WitnessReport
}

@Controller('witness-report')
export class WitnessController {
  constructor(private readonly service: WitnessService) {}

  /**
   * Validates the input, checks the FBI database, saves the report, and returns a confirmation message.
   *
   * @param body - The incoming data from the client, validated via DTO
   * @param ip - IP address of the request
   * @returns ReportWithMessage
   */
  @Post()
  @ApiBody({ type: WitnessReportDto })
  @ApiResponse({ status: 201, description: 'Report saved' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or FBI case not found',
  })
  async report(
    @Body() body: WitnessReportDto,
    @Ip() ip: string,
  ): Promise<ReportWithMessage> {
    const result = await this.service.saveAndGetReport(
      body.personOrCase,
      body.phone,
      ip,
    )

    return { message: 'Report saved.', report: result }
  }
}
