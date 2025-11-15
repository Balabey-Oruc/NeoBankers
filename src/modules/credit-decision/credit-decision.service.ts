import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditDecision } from '../../entities/credit-decision.entity';
import { CreditRequest } from '../../entities/credit-request.entity';
import { CreateCreditDecisionDto, UpdateCreditDecisionDto, CreditDecisionResponseDto } from './dto/credit-decision.dto';

@Injectable()
export class CreditDecisionService {
  constructor(
    @InjectRepository(CreditDecision)
    private creditDecisionRepository: Repository<CreditDecision>,
    @InjectRepository(CreditRequest)
    private creditRequestRepository: Repository<CreditRequest>,
  ) {}

  async create(createCreditDecisionDto: CreateCreditDecisionDto): Promise<CreditDecisionResponseDto> {
    const creditRequest = await this.creditRequestRepository.findOne({
      where: { id: createCreditDecisionDto.creditRequestId },
      relations: ['user', 'financialProfile'],
    });

    if (!creditRequest) {
      throw new NotFoundException('Credit request not found');
    }

    const existingDecision = await this.creditDecisionRepository.findOne({
      where: { creditRequestId: createCreditDecisionDto.creditRequestId },
    });

    if (existingDecision) {
      throw new ForbiddenException('Credit request already has a decision');
    }

    const monthlyPayment = createCreditDecisionDto.monthlyPayment || 
      this.calculateMonthlyPayment(
        createCreditDecisionDto.approvedAmount || creditRequest.requestedAmount,
        createCreditDecisionDto.finalInterestRate || creditRequest.interestRate,
        createCreditDecisionDto.approvedRepaymentPeriod || creditRequest.repaymentPeriodMonths
      );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const creditDecision = this.creditDecisionRepository.create({
      ...createCreditDecisionDto,
      monthlyPayment,
      reviewedAt: new Date(),
      expiresAt,
    });

    const savedDecision = await this.creditDecisionRepository.save(creditDecision);

    if (createCreditDecisionDto.decision === 'approved') {
      await this.creditRequestRepository.update(
        createCreditDecisionDto.creditRequestId,
        { status: 'approved', approvedAt: new Date() }
      );
    } else {
      await this.creditRequestRepository.update(
        createCreditDecisionDto.creditRequestId,
        { status: 'rejected', reviewedAt: new Date() }
      );
    }

    return this.formatCreditDecisionResponse(savedDecision);
  }

  async findAll(): Promise<CreditDecisionResponseDto[]> {
    const decisions = await this.creditDecisionRepository.find({
      relations: ['creditRequest', 'creditRequest.user', 'creditRequest.financialProfile'],
    });
    return decisions.map(decision => this.formatCreditDecisionResponse(decision));
  }

  async findOne(id: string): Promise<CreditDecisionResponseDto> {
    const decision = await this.creditDecisionRepository.findOne({
      where: { id },
      relations: ['creditRequest', 'creditRequest.user', 'creditRequest.financialProfile'],
    });

    if (!decision) {
      throw new NotFoundException('Credit decision not found');
    }

    return this.formatCreditDecisionResponse(decision);
  }

  async findByCreditRequestId(creditRequestId: string): Promise<CreditDecisionResponseDto> {
    const decision = await this.creditDecisionRepository.findOne({
      where: { creditRequestId },
      relations: ['creditRequest', 'creditRequest.user', 'creditRequest.financialProfile'],
    });

    if (!decision) {
      throw new NotFoundException('Credit decision not found');
    }

    return this.formatCreditDecisionResponse(decision);
  }

  async update(id: string, updateCreditDecisionDto: UpdateCreditDecisionDto): Promise<CreditDecisionResponseDto> {
    const decision = await this.creditDecisionRepository.findOne({ where: { id } });
    
    if (!decision) {
      throw new NotFoundException('Credit decision not found');
    }

    if (updateCreditDecisionDto.approvedAmount || updateCreditDecisionDto.finalInterestRate || updateCreditDecisionDto.approvedRepaymentPeriod) {
      const approvedAmount = updateCreditDecisionDto.approvedAmount || decision.approvedAmount;
      const finalInterestRate = updateCreditDecisionDto.finalInterestRate || decision.finalInterestRate;
      const approvedRepaymentPeriod = updateCreditDecisionDto.approvedRepaymentPeriod || decision.approvedRepaymentPeriod;
      
      const monthlyPayment = this.calculateMonthlyPayment(
        approvedAmount!,
        finalInterestRate!,
        approvedRepaymentPeriod!
      );
      
      updateCreditDecisionDto.monthlyPayment = monthlyPayment;
    }

    if (updateCreditDecisionDto.isAccepted && !decision.isAccepted) {
      updateCreditDecisionDto.acceptedAt = new Date();
    }

    await this.creditDecisionRepository.update(id, updateCreditDecisionDto);
    const updatedDecision = await this.creditDecisionRepository.findOne({
      where: { id },
      relations: ['creditRequest', 'creditRequest.user', 'creditRequest.financialProfile'],
    });
    
    return this.formatCreditDecisionResponse(updatedDecision!);
  }

  async acceptDecision(id: string): Promise<CreditDecisionResponseDto> {
    const decision = await this.creditDecisionRepository.findOne({ where: { id } });
    
    if (!decision) {
      throw new NotFoundException('Credit decision not found');
    }

    if (decision.isAccepted) {
      throw new ForbiddenException('Decision already accepted');
    }

    if (decision.expiresAt && decision.expiresAt < new Date()) {
      throw new ForbiddenException('Decision has expired');
    }

    await this.creditDecisionRepository.update(id, {
      isAccepted: true,
      acceptedAt: new Date(),
    });

    const updatedDecision = await this.creditDecisionRepository.findOne({
      where: { id },
      relations: ['creditRequest', 'creditRequest.user', 'creditRequest.financialProfile'],
    });
    
    return this.formatCreditDecisionResponse(updatedDecision!);
  }

  async remove(id: string): Promise<void> {
    const decision = await this.creditDecisionRepository.findOne({ where: { id } });
    
    if (!decision) {
      throw new NotFoundException('Credit decision not found');
    }

    await this.creditDecisionRepository.remove(decision);
  }

  private calculateMonthlyPayment(principal: number, annualRate: number, periodMonths: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, periodMonths)) / 
                          (Math.pow(1 + monthlyRate, periodMonths) - 1);
    return Math.round(monthlyPayment * 100) / 100;
  }

  private formatCreditDecisionResponse(decision: CreditDecision): CreditDecisionResponseDto {
    return {
      id: decision.id,
      creditRequestId: decision.creditRequestId,
      decision: decision.decision,
      approvedAmount: decision.approvedAmount,
      finalInterestRate: decision.finalInterestRate,
      approvedRepaymentPeriod: decision.approvedRepaymentPeriod,
      monthlyPayment: decision.monthlyPayment,
      reason: decision.reason,
      decisionFactors: decision.decisionFactors,
      riskScore: decision.riskScore,
      reviewedBy: decision.reviewedBy,
      reviewedAt: decision.reviewedAt,
      expiresAt: decision.expiresAt,
      isAccepted: decision.isAccepted,
      acceptedAt: decision.acceptedAt,
      createdAt: decision.createdAt,
      updatedAt: decision.updatedAt,
    };
  }
}
