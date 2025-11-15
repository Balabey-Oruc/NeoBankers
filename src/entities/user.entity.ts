import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CreditRequest } from './credit-request.entity';
import { FinancialProfile } from './financial-profile.entity';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CreditRequest, creditRequest => creditRequest.user)
  creditRequests: CreditRequest[];

  @OneToMany(() => FinancialProfile, financialProfile => financialProfile.user)
  financialProfiles: FinancialProfile[];

  @OneToMany(() => Notification, (notification: Notification) => notification.user)
  notifications: Notification[];
}
