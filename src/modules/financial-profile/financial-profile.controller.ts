import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FinancialProfileService } from './financial-profile.service';
import { CreateFinancialProfileDto, UpdateFinancialProfileDto, FinancialProfileResponseDto } from './dto/financial-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/types/request.interface';

@ApiTags('financial-profiles')
@UseGuards(JwtAuthGuard)
@Controller('financial-profiles')
export class FinancialProfileController {
  constructor(private readonly financialProfileService: FinancialProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial profile' })
  @ApiResponse({ status: 201, description: 'Financial profile successfully created', type: FinancialProfileResponseDto })
  @ApiResponse({ status: 403, description: 'User already has a financial profile' })
  async create(@Req() req: AuthenticatedRequest, @Body() createFinancialProfileDto: CreateFinancialProfileDto): Promise<FinancialProfileResponseDto> {
    const userId = req.user.id;
    return this.financialProfileService.create(userId, createFinancialProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all financial profiles' })
  @ApiResponse({ status: 200, description: 'Financial profiles retrieved successfully', type: [FinancialProfileResponseDto] })
  async findAll(): Promise<FinancialProfileResponseDto[]> {
    return this.financialProfileService.findAll();
  }

  @Get('my-profile')
  @ApiOperation({ summary: 'Get current user financial profile' })
  @ApiResponse({ status: 200, description: 'Financial profile retrieved successfully', type: FinancialProfileResponseDto })
  @ApiResponse({ status: 404, description: 'Financial profile not found' })
  async findMyProfile(@Req() req: AuthenticatedRequest): Promise<FinancialProfileResponseDto> {
    const userId = req.user.id;
    return this.financialProfileService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get financial profile by ID' })
  @ApiParam({ name: 'id', description: 'Financial profile ID' })
  @ApiResponse({ status: 200, description: 'Financial profile retrieved successfully', type: FinancialProfileResponseDto })
  @ApiResponse({ status: 404, description: 'Financial profile not found' })
  async findOne(@Param('id') id: string): Promise<FinancialProfileResponseDto> {
    return this.financialProfileService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update financial profile' })
  @ApiParam({ name: 'id', description: 'Financial profile ID' })
  @ApiResponse({ status: 200, description: 'Financial profile successfully updated', type: FinancialProfileResponseDto })
  @ApiResponse({ status: 404, description: 'Financial profile not found' })
  async update(@Param('id') id: string, @Body() updateFinancialProfileDto: UpdateFinancialProfileDto): Promise<FinancialProfileResponseDto> {
    return this.financialProfileService.update(id, updateFinancialProfileDto);
  }

  @Patch(':id/verification-status')
  @ApiOperation({ summary: 'Update financial profile verification status' })
  @ApiParam({ name: 'id', description: 'Financial profile ID' })
  @ApiResponse({ status: 200, description: 'Verification status successfully updated', type: FinancialProfileResponseDto })
  async updateVerificationStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'verified' | 'rejected'
  ): Promise<FinancialProfileResponseDto> {
    return this.financialProfileService.updateVerificationStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete financial profile' })
  @ApiParam({ name: 'id', description: 'Financial profile ID' })
  @ApiResponse({ status: 200, description: 'Financial profile successfully deleted' })
  @ApiResponse({ status: 404, description: 'Financial profile not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.financialProfileService.remove(id);
  }
}
