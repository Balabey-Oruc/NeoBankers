import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditDecisionService } from './credit-decision.service';
import { CreditDecisionController } from './credit-decision.controller';
import { CreditDecision } from '../../entities/credit-decision.entity';
import { CreditRequest } from '../../entities/credit-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditDecision, CreditRequest])],
  controllers: [CreditDecisionController],
  providers: [CreditDecisionService],
  exports: [CreditDecisionService],
})
export class CreditDecisionModule {}
