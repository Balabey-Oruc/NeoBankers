import { IsNumber, IsString, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreditRequestDto {
  @IsNumber()
  @Min(100)
  @Max(50000)
  @Type(() => Number)
  requestedAmount: number;

  @IsNumber()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  repaymentPeriodMonths: number;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsArray()
  supportingDocuments?: any[];
}

export class UpdateCreditRequestDto {
  @IsOptional()
  @IsEnum(['pending', 'under_review', 'approved', 'rejected', 'cancelled'])
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(50000)
  @Type(() => Number)
  requestedAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  repaymentPeriodMonths?: number;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsArray()
  supportingDocuments?: any[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  repaymentAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  mlScore?: number;
}

export class CreditRequestResponseDto {
  id: string;
  userId: string;
  financialProfileId?: string;
  requestedAmount: number;
  repaymentAmount: number;
  repaymentPeriodMonths: number;
  interestRate: number;
  purpose?: string;
  status: string;
  supportingDocuments?: any[];
  mlScore?: number;
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CreditRequestListQueryDto {
  @IsOptional()
  @IsEnum(['pending', 'under_review', 'approved', 'rejected', 'cancelled'])
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
