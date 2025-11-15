import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { FinancialProfile } from './financial-profile.entity';
import { CreditDecision } from './credit-decision.entity';

@Entity('credit_requests')
export class CreditRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.creditRequests)
  user: User;

  @Column({ nullable: true })
  financialProfileId: string;

  @ManyToOne(() => FinancialProfile, financialProfile => financialProfile.creditRequests)
  financialProfile: FinancialProfile;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  repaymentAmount: number;

  @Column({ type: 'int' })
  repaymentPeriodMonths: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Column({ nullable: true })
  purpose: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  supportingDocuments: any[];

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  mlScore: number;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CreditDecision, creditDecision => creditDecision.creditRequest)
  creditDecisions: CreditDecision[];
}
