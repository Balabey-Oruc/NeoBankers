import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditRequest } from '../../entities/credit-request.entity';
import { FinancialProfile } from '../../entities/financial-profile.entity';
import { User } from '../../entities/user.entity';
import { CreateCreditRequestDto, UpdateCreditRequestDto, CreditRequestResponseDto, CreditRequestListQueryDto } from './dto/credit-request.dto';

@Injectable()
export class CreditRequestService {
  constructor(
    @InjectRepository(CreditRequest)
    private creditRequestRepository: Repository<CreditRequest>,
    @InjectRepository(FinancialProfile)
    private financialProfileRepository: Repository<FinancialProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, createCreditRequestDto: CreateCreditRequestDto): Promise<CreditRequestResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const financialProfile = await this.financialProfileRepository.findOne({
      where: { userId },
    });

    if (!financialProfile) {
      throw new ForbiddenException('User must have a financial profile to create credit requests');
    }

    const interestRate = this.calculateInterestRate(createCreditRequestDto.requestedAmount, createCreditRequestDto.repaymentPeriodMonths);
    const repaymentAmount = this.calculateRepaymentAmount(createCreditRequestDto.requestedAmount, interestRate, createCreditRequestDto.repaymentPeriodMonths);

    const creditRequest = this.creditRequestRepository.create({
      userId,
      financialProfileId: financialProfile.id,
      ...createCreditRequestDto,
      repaymentAmount,
      interestRate,
      submittedAt: new Date(),
    });

    const savedRequest = await this.creditRequestRepository.save(creditRequest);
    return this.formatCreditRequestResponse(savedRequest);
  }

  async findAll(query: CreditRequestListQueryDto): Promise<{ requests: CreditRequestResponseDto[]; total: number }> {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.creditRequestRepository
      .createQueryBuilder('creditRequest')
      .leftJoinAndSelect('creditRequest.user', 'user')
      .leftJoinAndSelect('creditRequest.financialProfile', 'financialProfile');

    if (status) {
      queryBuilder.where('creditRequest.status = :status', { status });
    }

    queryBuilder.orderBy(`creditRequest.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();
    
    return {
      requests: requests.map(request => this.formatCreditRequestResponse(request)),
      total,
    };
  }

  async findUserRequests(userId: string, query: CreditRequestListQueryDto): Promise<{ requests: CreditRequestResponseDto[]; total: number }> {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.creditRequestRepository
      .createQueryBuilder('creditRequest')
      .leftJoinAndSelect('creditRequest.user', 'user')
      .leftJoinAndSelect('creditRequest.financialProfile', 'financialProfile')
      .where('creditRequest.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('creditRequest.status = :status', { status });
    }

    queryBuilder.orderBy(`creditRequest.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();
    
    return {
      requests: requests.map(request => this.formatCreditRequestResponse(request)),
      total,
    };
  }

  async findOne(id: string): Promise<CreditRequestResponseDto> {
    const request = await this.creditRequestRepository.findOne({
      where: { id },
      relations: ['user', 'financialProfile'],
    });

    if (!request) {
      throw new NotFoundException('Credit request not found');
    }

    return this.formatCreditRequestResponse(request);
  }

  async update(id: string, updateCreditRequestDto: UpdateCreditRequestDto): Promise<CreditRequestResponseDto> {
    const request = await this.creditRequestRepository.findOne({ where: { id } });
    
    if (!request) {
      throw new NotFoundException('Credit request not found');
    }

    if (updateCreditRequestDto.requestedAmount || updateCreditRequestDto.repaymentPeriodMonths) {
      const requestedAmount = updateCreditRequestDto.requestedAmount || request.requestedAmount;
      const repaymentPeriodMonths = updateCreditRequestDto.repaymentPeriodMonths || request.repaymentPeriodMonths;
      
      const interestRate = this.calculateInterestRate(requestedAmount, repaymentPeriodMonths);
      const repaymentAmount = this.calculateRepaymentAmount(requestedAmount, interestRate, repaymentPeriodMonths);
      
      updateCreditRequestDto.interestRate = interestRate;
      updateCreditRequestDto.repaymentAmount = repaymentAmount;
    }

    await this.creditRequestRepository.update(id, updateCreditRequestDto);
    const updatedRequest = await this.creditRequestRepository.findOne({
      where: { id },
      relations: ['user', 'financialProfile'],
    });
    
    return this.formatCreditRequestResponse(updatedRequest!);
  }

  async updateStatus(id: string, status: string, reviewedAt?: Date): Promise<CreditRequestResponseDto> {
    const request = await this.creditRequestRepository.findOne({ where: { id } });
    
    if (!request) {
      throw new NotFoundException('Credit request not found');
    }

    const updateData: any = { status };
    if (reviewedAt) {
      updateData.reviewedAt = reviewedAt;
    }
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    await this.creditRequestRepository.update(id, updateData);
    const updatedRequest = await this.creditRequestRepository.findOne({
      where: { id },
      relations: ['user', 'financialProfile'],
    });
    
    return this.formatCreditRequestResponse(updatedRequest!);
  }

  async remove(id: string): Promise<void> {
    const request = await this.creditRequestRepository.findOne({ where: { id } });
    
    if (!request) {
      throw new NotFoundException('Credit request not found');
    }

    await this.creditRequestRepository.remove(request);
  }

  private calculateInterestRate(amount: number, periodMonths: number): number {
    let baseRate = 5.0;
    
    if (amount > 10000) baseRate += 1.0;
    if (periodMonths > 12) baseRate += 0.5;
    if (periodMonths > 24) baseRate += 0.5;
    
    return Math.min(baseRate, 15.0);
  }

  private calculateRepaymentAmount(principal: number, annualRate: number, periodMonths: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, periodMonths)) / 
                          (Math.pow(1 + monthlyRate, periodMonths) - 1);
    return Math.round(monthlyPayment * periodMonths * 100) / 100;
  }

  private formatCreditRequestResponse(request: CreditRequest): CreditRequestResponseDto {
    return {
      id: request.id,
      userId: request.userId,
      financialProfileId: request.financialProfileId,
      requestedAmount: request.requestedAmount,
      repaymentAmount: request.repaymentAmount,
      repaymentPeriodMonths: request.repaymentPeriodMonths,
      interestRate: request.interestRate,
      purpose: request.purpose,
      status: request.status,
      supportingDocuments: request.supportingDocuments,
      mlScore: request.mlScore,
      submittedAt: request.submittedAt,
      reviewedAt: request.reviewedAt,
      approvedAt: request.approvedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
