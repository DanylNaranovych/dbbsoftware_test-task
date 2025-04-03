import { Test, TestingModule } from '@nestjs/testing';
import { StaffCalculatorService, teamMember, enumMemberType } from './staff-calculator.service';

jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));

// class TeamMemberHelper {
//   constructor(
//     public name: string,
//     public hiringDay: Date,
//     public memberType: enumMemberType,
//     public supervisor: any,
//     public subordinates: any[] = [],
//   ) {}
// }

describe('StaffCalculatorService', () => {
  let service: StaffCalculatorService;
  let supervisor: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffCalculatorService],
    }).compile();

    service = module.get<StaffCalculatorService>(StaffCalculatorService);
    (service as any).teamMembers = [];
    
    const hiringDate = new Date('2020-01-01');
    supervisor = new teamMember('Supervisor', hiringDate, enumMemberType.Manager);
  });

  it('should calculate total team salary', () => {
    const emp1 = new teamMember('Emp1', new Date('2021-01-01'), enumMemberType.Employe, supervisor);
    const emp2 = new teamMember('Emp2', new Date('2021-01-01'), enumMemberType.Employe, supervisor);
    const manager = new teamMember('Manager', new Date('2020-01-01'), enumMemberType.Manager, supervisor);
    (manager as any).subordinates = [emp1, emp2];

    (service as any).teamMembers = [emp1, emp2, manager];
    
    const total = service.colculateStaffSalary();
    const expected = 
      emp1.calculateCurrentSalary() +
      emp2.calculateCurrentSalary() +
      manager.calculateCurrentSalary();
    
    expect(total).toBeCloseTo(expected);
  });

  it('should add new member to team', () => {
    const emp = new teamMember('Emp', new Date(), enumMemberType.Employe, supervisor);
    service.addNewMember(emp);
    expect((service as any).teamMembers.length).toBe(1);
  });
});

describe('teamMember', () => {
  let supervisor: any;

  beforeEach(() => {
    const hiringDate = new Date('2020-01-01');
    supervisor = new teamMember('Supervisor', hiringDate, enumMemberType.Manager);
  });

  describe('getFullYearsOfWork', () => {
    it('should calculate years worked correctly', () => {
      const testCases = [
        { hire: '2023-01-01', asOf: '2023-01-01', expected: 0 },
        { hire: '2020-01-01', asOf: '2023-01-01', expected: 3 },
        { hire: '2020-02-01', asOf: '2023-01-01', expected: 2 },
        { hire: '2020-01-02', asOf: '2023-01-01', expected: 2 },
      ];

      testCases.forEach(({ hire, asOf, expected }) => {
        const member = new teamMember('Test', new Date(hire), enumMemberType.Employe, supervisor);
        const result = member.getFullYearsOfWork(new Date(asOf));
        expect(result).toBe(expected);
      });
    });
  });

  describe('calculateCurrentSalary', () => {
    it('should calculate Employee salary correctly', () => {
      const member = new teamMember('Emp', new Date('2021-01-01'), enumMemberType.Employe, supervisor);
      
      expect(member.calculateCurrentSalary(new Date('2023-01-01'))).toBeCloseTo(5000 * 1.03 ** 2);
      expect(member.calculateCurrentSalary(new Date('2050-01-01'))).toBeCloseTo(5000 * 1.30);
    });

    it('should calculate Manager salary with subordinates', () => {
      const manager = new teamMember('Manager', new Date('2020-01-01'), enumMemberType.Manager, supervisor);
      const emp = new teamMember('Emp', new Date('2021-01-01'), enumMemberType.Employe, manager);
      (manager as any).subordinates = [emp];

      const expectedBase = 5000 * (1.05 ** 3);
      const expectedBonus = emp.calculateCurrentSalary() * 0.05;
      expect(manager.calculateCurrentSalary()).toBeCloseTo(expectedBase + expectedBonus);
    });

    it('should calculate Sales salary with nested subordinates', () => {
      const sales = new teamMember('Sales', new Date('2018-01-01'), enumMemberType.Sales, supervisor);
      const manager = new teamMember('Manager', new Date('2020-01-01'), enumMemberType.Manager, sales);
      const emp = new teamMember('Emp', new Date('2021-01-01'), enumMemberType.Employe, manager);
      (manager as any).subordinates = [emp];
      (sales as any).subordinates = [manager];

      const salesBase = 5000 * (1.01 ** 5);
      const managerSalary = manager.calculateCurrentSalary();
      const expectedSalary = salesBase + (managerSalary * 0.03);
      
      expect(sales.calculateCurrentSalary()).toBeCloseTo(expectedSalary);
    });
  });

  describe('constructor', () => {
    it('should throw error if Employee has subordinates', () => {
      expect(() => {
        new teamMember(
          'Emp',
          new Date(),
          enumMemberType.Employe,
          supervisor,
          [new teamMember('Sub', new Date(), enumMemberType.Employe, supervisor)]
        );
      }).toThrow('An employee cannot have subordinates');
    });
  });

  describe('addSubordinate', () => {
    it('should throw error when Employee adds subordinate', () => {
      const emp = new teamMember('Emp', new Date(), enumMemberType.Employe, supervisor);
      const sub = new teamMember('Sub', new Date(), enumMemberType.Employe, emp);
      
      expect(() => (emp as any).addSubordinate(sub)).toThrow('An employee cannot have subordinates');
    });

    it('should update salary after adding subordinate', () => {
      const manager = new teamMember('Manager', new Date('2020-01-01'), enumMemberType.Manager, supervisor);
      const initialSalary = manager.calculateCurrentSalary();
      
      const emp = new teamMember('Emp', new Date('2021-01-01'), enumMemberType.Employe, manager);
      (manager as any).addSubordinate(emp);
      
      expect(manager.calculateCurrentSalary()).toBeGreaterThan(initialSalary);
    });
  });
});