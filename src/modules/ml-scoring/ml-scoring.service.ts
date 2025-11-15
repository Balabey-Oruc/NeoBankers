import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditRequest } from '../../entities/credit-request.entity';
import { FinancialProfile } from '../../entities/financial-profile.entity';
import { User } from '../../entities/user.entity';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface MLScoringRequest {
  userId: string;
  financialProfile: {
    income: number;
    expenses: number;
    debts: number;
    employmentStatus: string;
    employmentDuration: number;
    creditScore: number;
    verificationStatus: string;
  };
  creditRequest: {
    requestedAmount: number;
    repaymentPeriodMonths: number;
    purpose: string;
  };
  userProfile: {
    age: number;
    registrationDate: string;
  };
}

export interface MLScoringResponse {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  recommendation: 'approve' | 'reject' | 'manual_review';
  explanation: string;
}

@Injectable()
export class MLScoringService {
  private readonly logger = new Logger(MLScoringService.name);
  private readonly pythonApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(CreditRequest)
    private readonly creditRequestRepository: Repository<CreditRequest>,
    @InjectRepository(FinancialProfile)
    private readonly financialProfileRepository: Repository<FinancialProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.pythonApiUrl = this.configService.get<string>('PYTHON_ML_API_URL', 'http://localhost:8000');
  }

  async calculateScore(creditRequestId: string): Promise<MLScoringResponse> {
    const creditRequest = await this.creditRequestRepository.findOne({
      where: { id: creditRequestId },
      relations: ['user', 'financialProfile'],
    });

    if (!creditRequest || !creditRequest.user || !creditRequest.financialProfile) {
      throw new Error('Credit request with user and financial profile not found');
    }

    const scoringRequest: MLScoringRequest = {
      userId: creditRequest.userId,
      financialProfile: {
        income: creditRequest.financialProfile.monthlyIncome,
        expenses: creditRequest.financialProfile.monthlyExpenses,
        debts: creditRequest.financialProfile.existingDebts,
        employmentStatus: creditRequest.financialProfile.employmentStatus,
        employmentDuration: creditRequest.financialProfile.employmentDuration || 0,
        creditScore: creditRequest.financialProfile.creditScore || 0,
        verificationStatus: creditRequest.financialProfile.verificationStatus,
      },
      creditRequest: {
        requestedAmount: creditRequest.requestedAmount,
        repaymentPeriodMonths: creditRequest.repaymentPeriodMonths,
        purpose: creditRequest.purpose,
      },
      userProfile: {
        age: this.calculateAge(creditRequest.user.dateOfBirth.toISOString()),
        registrationDate: creditRequest.user.createdAt.toISOString(),
      },
    };

    try {
      const response: AxiosResponse<MLScoringResponse> = await firstValueFrom(
        this.httpService.post<MLScoringResponse>(
          `${this.pythonApiUrl}/api/score`,
          scoringRequest,
          {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const score = response.data;
      
      await this.creditRequestRepository.update(creditRequestId, {
        mlScore: score.score,
      });

      this.logger.log(`ML score calculated for credit request ${creditRequestId}: ${score.score}`);
      return score;
    } catch (error) {
      this.logger.error(`Failed to calculate ML score for credit request ${creditRequestId}:`, error.message);
      
      const fallbackScore = this.calculateFallbackScore(scoringRequest);
      
      await this.creditRequestRepository.update(creditRequestId, {
        mlScore: fallbackScore.score,
      });

      return fallbackScore;
    }
  }

  async batchCalculateScores(creditRequestIds: string[]): Promise<{ [key: string]: MLScoringResponse }> {
    const results: { [key: string]: MLScoringResponse } = {};

    for (const id of creditRequestIds) {
      try {
        results[id] = await this.calculateScore(id);
      } catch (error) {
        this.logger.error(`Failed to calculate score for credit request ${id}:`, error.message);
      }
    }

    return results;
  }

  async getScoreHistory(userId: string): Promise<any[]> {
    const creditRequests = await this.creditRequestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return creditRequests.map(request => ({
      creditRequestId: request.id,
      score: request.mlScore,
      requestedAmount: request.requestedAmount,
      status: request.status,
      createdAt: request.createdAt,
    }));
  }

  private calculateFallbackScore(request: MLScoringRequest): MLScoringResponse {
    let score = 0.5;
    const factors: any[] = [];

    const debtToIncomeRatio = request.financialProfile.debts / request.financialProfile.income;
    if (debtToIncomeRatio < 0.3) {
      score += 0.2;
      factors.push({
        name: 'Low Debt-to-Income Ratio',
        impact: 0.2,
        description: 'Debt-to-income ratio is below 30%',
      });
    } else if (debtToIncomeRatio > 0.5) {
      score -= 0.3;
      factors.push({
        name: 'High Debt-to-Income Ratio',
        impact: -0.3,
        description: 'Debt-to-income ratio exceeds 50%',
      });
    }

    if (request.financialProfile.creditScore > 700) {
      score += 0.2;
      factors.push({
        name: 'Good Credit Score',
        impact: 0.2,
        description: 'Credit score is above 700',
      });
    } else if (request.financialProfile.creditScore < 600) {
      score -= 0.2;
      factors.push({
        name: 'Poor Credit Score',
        impact: -0.2,
        description: 'Credit score is below 600',
      });
    }

    if (request.financialProfile.employmentDuration > 24) {
      score += 0.1;
      factors.push({
        name: 'Stable Employment',
        impact: 0.1,
        description: 'Employment duration exceeds 2 years',
      });
    }

    const amountToIncomeRatio = request.creditRequest.requestedAmount / request.financialProfile.income;
    if (amountToIncomeRatio < 0.5) {
      score += 0.1;
      factors.push({
        name: 'Reasonable Loan Amount',
        impact: 0.1,
        description: 'Loan amount is less than 50% of annual income',
      });
    } else if (amountToIncomeRatio > 1) {
      score -= 0.2;
      factors.push({
        name: 'High Loan Amount',
        impact: -0.2,
        description: 'Loan amount exceeds annual income',
      });
    }

    score = Math.max(0, Math.min(1, score));

    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    let recommendation: 'approve' | 'reject' | 'manual_review' = 'manual_review';

    if (score >= 0.7) {
      riskLevel = 'low';
      recommendation = 'approve';
    } else if (score >= 0.4) {
      riskLevel = 'medium';
      recommendation = 'manual_review';
    } else {
      riskLevel = 'high';
      recommendation = 'reject';
    }

    return {
      score,
      riskLevel,
      confidence: 0.7,
      factors,
      recommendation,
      explanation: `Fallback score calculated based on financial ratios and credit history. Final score: ${score.toFixed(3)}`,
    };
  }

  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.pythonApiUrl}/health`, {
          timeout: 5000,
        })
      );
      return true;
    } catch (error) {
      this.logger.error('Python ML API health check failed:', error.message);
      return false;
    }
  }
}
