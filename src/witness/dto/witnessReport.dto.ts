import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class WitnessReportDto {
  @ApiProperty({
    example: 'Jelena Nikolic',
    description: 'Name or part of FBI case title',
  })
  @IsNotEmpty()
  @IsString()
  personOrCase: string

  @ApiProperty({
    example: '+381641112233',
    description: 'Phone number of the witness',
  })
  @IsNotEmpty()
  @IsString()
  phone: string
}
