import { Module } from '@nestjs/common'
import { WitnessModule } from './witness/witness.module'
@Module({
  imports: [WitnessModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
