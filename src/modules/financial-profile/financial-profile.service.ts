import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialProfile } from '../../entities/financial-profile.entity';
import { User } from '../../entities/user.entity';
import { CreateFinancialProfileDto, UpdateFinancialProfileDto, FinancialProfileResponseDto } from './dto/financial-profile.dto';

@Injectable()
export class FinancialProfileService {
  constructor(
    @InjectRepository(FinancialProfile)
    private financialProfileRepository: Repository<FinancialProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, createFinancialProfileDto: CreateFinancialProfileDto): Promise<FinancialProfileResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.financialProfileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ForbiddenException('User already has a financial profile');
    }

    const financialProfile = this.financialProfileRepository.create({
      userId,
      ...createFinancialProfileDto,
    });

    const savedProfile = await this.financialProfileRepository.save(financialProfile);
    return this.formatFinancialProfileResponse(savedProfile);
  }

  async findAll(): Promise<FinancialProfileResponseDto[]> {
    const profiles = await this.financialProfileRepository.find({
      relations: ['user'],
    });
    return profiles.map(profile => this.formatFinancialProfileResponse(profile));
  }

  async findOne(id: string): Promise<FinancialProfileResponseDto> {
    const profile = await this.financialProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Financial profile not found');
    }

    return this.formatFinancialProfileResponse(profile);
  }

  async findByUserId(userId: string): Promise<FinancialProfileResponseDto> {
    const profile = await this.financialProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Financial profile not found');
    }

    return this.formatFinancialProfileResponse(profile);
  }

  async update(id: string, updateFinancialProfileDto: UpdateFinancialProfileDto): Promise<FinancialProfileResponseDto> {
    const profile = await this.financialProfileRepository.findOne({ where: { id } });
    
    if (!profile) {
      throw new NotFoundException('Financial profile not found');
    }

    await this.financialProfileRepository.update(id, updateFinancialProfileDto);
    const updatedProfile = await this.financialProfileRepository.findOne({ 
      where: { id },
      relations: ['user'],
    });
    
    return this.formatFinancialProfileResponse(updatedProfile!);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.financialProfileRepository.findOne({ where: { id } });
    
    if (!profile) {
      throw new NotFoundException('Financial profile not found');
    }

    await this.financialProfileRepository.remove(profile);
  }

  async updateVerificationStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<FinancialProfileResponseDto> {
    const profile = await this.financialProfileRepository.findOne({ where: { id } });
    
    if (!profile) {
      throw new NotFoundException('Financial profile not found');
    }

    await this.financialProfileRepository.update(id, { verificationStatus: status });
    const updatedProfile = await this.financialProfileRepository.findOne({ 
      where: { id },
      relations: ['user'],
    });
    
    return this.formatFinancialProfileResponse(updatedProfile!);
  }

  private formatFinancialProfileResponse(profile: FinancialProfile): FinancialProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      monthlyIncome: profile.monthlyIncome,
      monthlyExpenses: profile.monthlyExpenses,
      existingDebts: profile.existingDebts,
      employmentStatus: profile.employmentStatus,
      employerName: profile.employerName,
      employmentDuration: profile.employmentDuration,
      creditScore: profile.creditScore,
      bankAccountNumber: profile.bankAccountNumber,
      bankName: profile.bankName,
      verificationStatus: profile.verificationStatus,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
