import { Module } from '@nestjs/common';
import { StaffCalculatorController } from './staff-calculator.controller';
import { StaffCalculatorService } from './staff-calculator.service';

@Module({
  controllers: [StaffCalculatorController],
  providers: [StaffCalculatorService]
})
export class StaffCalculatorModule {}
