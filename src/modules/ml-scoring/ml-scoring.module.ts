import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MLScoringService } from './ml-scoring.service';
import { CreditRequest } from '../../entities/credit-request.entity';
import { FinancialProfile } from '../../entities/financial-profile.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([CreditRequest, FinancialProfile, User]),
  ],
  providers: [MLScoringService],
  exports: [MLScoringService],
})
export class MLScoringModule {}
