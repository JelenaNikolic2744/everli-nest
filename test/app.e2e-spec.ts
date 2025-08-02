/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from '../src/app.module'
import { WitnessReport } from '../src/witness/interface/witnessReport.interface'
import { WitnessService } from '../src/witness/witness.service'

describe('WitnessController (e2e)', () => {
  let app: INestApplication
  let witnessService: WitnessService

  const mockReport = {
    personOrCase: 'Jelena Nikolic',
    phone: '+381641112233',
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    await app.init()

    witnessService = app.get<WitnessService>(WitnessService)
  })

  afterAll(async () => {
    await app.close()
  })

  it('/witness-report (POST) - success (mocked service)', async () => {
    jest
      .spyOn(witnessService, 'saveAndGetReport')
      .mockResolvedValue(mockReport as WitnessReport)

    return request(app.getHttpServer())
      .post('/witness-report')
      .send({
        personOrCase: 'Jelena Nikolic',
        phone: '+381641112233',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Report saved.')
        expect(res.body).toHaveProperty('report')
        expect(res.body.report).toMatchObject(mockReport)
      })
  })

  it('/witness-report (POST) - failure (real service or validation)', () => {
    // No mock here, real service runs or validation error triggers 400
    return request(app.getHttpServer())
      .post('/witness-report')
      .send({
        personOrCase: '', // invalid input
        phone: '+381641112233',
      })
      .expect(400)
  })
})
