import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { CreditRequest } from './credit-request.entity';

@Entity('financial_profiles')
export class FinancialProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.financialProfiles)
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyIncome: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyExpenses: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  existingDebts: number;

  @Column({ nullable: true })
  employmentStatus: string;

  @Column({ nullable: true })
  employerName: string;

  @Column({ nullable: true })
  employmentDuration: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  creditScore: number;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ default: 'pending' })
  verificationStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CreditRequest, creditRequest => creditRequest.financialProfile)
  creditRequests: CreditRequest[];
}
