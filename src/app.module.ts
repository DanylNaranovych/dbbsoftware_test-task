import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaffCalculatorModule } from './staff-calculator/staff-calculator.module';

@Module({
  imports: [StaffCalculatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
