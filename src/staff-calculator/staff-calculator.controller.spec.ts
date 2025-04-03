import { Test, TestingModule } from '@nestjs/testing';
import { StaffCalculatorController } from './staff-calculator.controller';

describe('StaffCalculatorController', () => {
  let controller: StaffCalculatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffCalculatorController],
    }).compile();

    controller = module.get<StaffCalculatorController>(StaffCalculatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
