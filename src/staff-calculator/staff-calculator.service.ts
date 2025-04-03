import { Injectable } from '@nestjs/common';

export enum enumMemberType {
    Employe,
    Manager,
    Sales,
}

export class teamMember {
    private name: string;
    private hiringDay: Date;
    private salary: number = 5000;
    private memberType: enumMemberType;
    private supervisor?: teamMember;
    private subordinates: teamMember[];

    public getFullYearsOfWork(asOfDate?: Date): number {
        const targetDate = asOfDate || new Date();
        let years = targetDate.getFullYear() - this.hiringDay.getFullYear();
        const monthDiff = targetDate.getMonth() - this.hiringDay.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && targetDate.getDate() < this.hiringDay.getDate())
        ) {
            years--;
        }

        return Math.max(years, 0);
    }


    public calculateCurrentSalary(asOfDate?: Date): number {
        const yearsWorked = this.getFullYearsOfWork(asOfDate);
        var salaryIncreasePercent = 0;
        var salaryIncreaseSubordinates = 0;

        console.log(`[${this.name}] Расчет зарплаты для ${enumMemberType[this.memberType]} при ${yearsWorked} годах в команде на дату: `, asOfDate || new Date());

        switch (this.memberType) {
            case enumMemberType.Employe:
                salaryIncreasePercent = Math.pow(1.03, yearsWorked);
                if (salaryIncreasePercent > 1.30) salaryIncreasePercent = 1.30;

                break;

            case enumMemberType.Manager:
                salaryIncreasePercent = Math.pow(1.05, yearsWorked);
                if (salaryIncreasePercent > 1.40) salaryIncreasePercent = 1.40;

                this.subordinates.forEach(subordinate => {
                    if (subordinate.memberType === enumMemberType.Employe) {
                        salaryIncreaseSubordinates += (subordinate.calculateCurrentSalary(asOfDate) * 0.05);
                    }
                });

                break;

            case enumMemberType.Sales:
                salaryIncreasePercent = Math.pow(1.01, yearsWorked);
                if (salaryIncreasePercent > 1.35) salaryIncreasePercent = 1.35;

                this.subordinates.forEach(subordinate => {
                    salaryIncreaseSubordinates += (subordinate.calculateCurrentSalary(asOfDate) * 0.03);
                });

                break;

            default:
                break;
        }
        console.log(`[${this.name}] Итоговая зарплата: ${(5000 * salaryIncreasePercent) + salaryIncreaseSubordinates}`);
        return (5000 * salaryIncreasePercent) + salaryIncreaseSubordinates;
    }

    constructor(
        name: string,
        hiringDay: Date,
        memberType: enumMemberType,
        supervisor?: teamMember,
        subordinates: teamMember[] = []
    ) {
        if (memberType === enumMemberType.Employe && subordinates.length > 0) {
            throw new Error("An employee cannot have subordinates");
        }

        this.name = name;
        this.hiringDay = hiringDay;
        this.memberType = memberType;
        this.supervisor = supervisor;
        this.subordinates = subordinates;

        this.salary = this.calculateCurrentSalary();
    }

    public addSubordinate(member: teamMember): void {
        if (this.memberType === enumMemberType.Employe) {
            throw new Error("An employee cannot have subordinates");
        }

        this.subordinates.push(member);
        this.salary = this.calculateCurrentSalary();
    }
}

@Injectable()
export class StaffCalculatorService {
    private teamMembers: teamMember[];

    public colculateStaffSalary(asOfDate?: Date): number {
        var summaryTeamSalary = 0;

        this.teamMembers.forEach(teamMember => {
            summaryTeamSalary += teamMember.calculateCurrentSalary(asOfDate);
        })

        console.log(`Итоговая зарплата всей команды: ${summaryTeamSalary}`);
        return summaryTeamSalary;
    }

    public addNewMember(member: teamMember): void {
        this.teamMembers.push(member);
    }
}
