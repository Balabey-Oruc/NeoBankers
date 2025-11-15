import { IsNumber, IsString, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreditDecisionDto {
  @IsString()
  creditRequestId: string;

  @IsEnum(['approved', 'rejected', 'needs_review'])
  decision: 'approved' | 'rejected' | 'needs_review';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  approvedAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  finalInterestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  approvedRepaymentPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyPayment?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  decisionFactors?: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  riskScore?: number;

  @IsOptional()
  @IsString()
  reviewedBy?: string;
}

export class UpdateCreditDecisionDto {
  @IsOptional()
  @IsEnum(['approved', 'rejected', 'needs_review'])
  decision?: 'approved' | 'rejected' | 'needs_review';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  approvedAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  finalInterestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  approvedRepaymentPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyPayment?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  decisionFactors?: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  riskScore?: number;

  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @IsOptional()
  @IsBoolean()
  isAccepted?: boolean;

  @IsOptional()
  acceptedAt?: Date;
}

export class CreditDecisionResponseDto {
  id: string;
  creditRequestId: string;
  decision: string;
  approvedAmount?: number;
  finalInterestRate?: number;
  approvedRepaymentPeriod?: number;
  monthlyPayment?: number;
  reason?: string;
  decisionFactors?: any;
  riskScore?: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  expiresAt?: Date;
  isAccepted: boolean;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
