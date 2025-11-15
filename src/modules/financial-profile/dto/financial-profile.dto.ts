import { IsNumber, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFinancialProfileDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyIncome: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyExpenses: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  existingDebts: number;

  @IsEnum(['employed', 'self-employed', 'unemployed', 'student', 'retired'])
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired';

  @IsOptional()
  @IsString()
  employerName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  employmentDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(300)
  @Max(850)
  @Type(() => Number)
  creditScore?: number;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;
}

export class UpdateFinancialProfileDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyIncome?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyExpenses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  existingDebts?: number;

  @IsOptional()
  @IsEnum(['employed', 'self-employed', 'unemployed', 'student', 'retired'])
  employmentStatus?: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired';

  @IsOptional()
  @IsString()
  employerName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  employmentDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(300)
  @Max(850)
  @Type(() => Number)
  creditScore?: number;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsEnum(['pending', 'verified', 'rejected'])
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

export class FinancialProfileResponseDto {
  id: string;
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingDebts: number;
  employmentStatus: string;
  employerName?: string;
  employmentDuration?: number;
  creditScore?: number;
  bankAccountNumber?: string;
  bankName?: string;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
