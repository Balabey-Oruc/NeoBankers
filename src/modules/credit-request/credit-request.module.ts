import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditRequestService } from './credit-request.service';
import { CreditRequestController } from './credit-request.controller';
import { CreditRequest } from '../../entities/credit-request.entity';
import { FinancialProfile } from '../../entities/financial-profile.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditRequest, FinancialProfile, User])],
  controllers: [CreditRequestController],
  providers: [CreditRequestService],
  exports: [CreditRequestService],
})
export class CreditRequestModule {}
