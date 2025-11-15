import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialProfileService } from './financial-profile.service';
import { FinancialProfileController } from './financial-profile.controller';
import { FinancialProfile } from '../../entities/financial-profile.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialProfile, User])],
  controllers: [FinancialProfileController],
  providers: [FinancialProfileService],
  exports: [FinancialProfileService],
})
export class FinancialProfileModule {}
