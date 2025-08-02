/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { WitnessReportDto } from './dto/witnessReport.dto'
import { WitnessReport } from './interface/witnessReport.interface'
import { WitnessController } from './witness.controller'
import { WitnessService } from './witness.service'

describe('WitnessController', () => {
  let controller: WitnessController
  let service: WitnessService

  const mockService = {
    saveAndGetReport: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WitnessController],
      providers: [{ provide: WitnessService, useValue: mockService }],
    }).compile()

    controller = module.get<WitnessController>(WitnessController)
    service = module.get<WitnessService>(WitnessService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return success message and report on valid input', async () => {
    const dto: WitnessReportDto = {
      personOrCase: 'John Doe',
      phone: '+1234567890',
    }

    const mockReport: WitnessReport = {
      personOrCase: 'John Doe',
      phone: '+1234567890',
      isValidCase: true,
      country: 'US',
      date: '30.07.2025',
    }

    mockService.saveAndGetReport.mockResolvedValueOnce(mockReport)

    const result = await controller.report(dto, '127.0.0.1')

    expect(result).toEqual({
      message: 'Report saved.',
      report: mockReport,
    })

    expect(service.saveAndGetReport).toHaveBeenCalledWith(
      dto.personOrCase,
      dto.phone,
      '127.0.0.1',
    )
  })

  it('should throw BadRequestException if service throws one', async () => {
    const dto: WitnessReportDto = {
      personOrCase: 'Fake Name',
      phone: 'invalid-phone',
    }

    mockService.saveAndGetReport.mockRejectedValueOnce(
      new BadRequestException('Invalid phone number'),
    )

    await expect(controller.report(dto, '127.0.0.1')).rejects.toThrow(
      BadRequestException,
    )
  })
})
