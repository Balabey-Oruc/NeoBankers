import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { CreditRequest } from './credit-request.entity';

@Entity('credit_decisions')
export class CreditDecision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  creditRequestId: string;

  @ManyToOne(() => CreditRequest, creditRequest => creditRequest.creditDecisions)
  creditRequest: CreditRequest;

  @Column()
  decision: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalInterestRate: number;

  @Column({ type: 'int', nullable: true })
  approvedRepaymentPeriod: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyPayment: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'jsonb', nullable: true })
  decisionFactors: any;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  riskScore: number;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isAccepted: boolean;

  @Column({ nullable: true })
  acceptedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
