import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreditDecisionService } from './credit-decision.service';
import { CreateCreditDecisionDto, UpdateCreditDecisionDto, CreditDecisionResponseDto } from './dto/credit-decision.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('credit-decisions')
@UseGuards(JwtAuthGuard)
@Controller('credit-decisions')
export class CreditDecisionController {
  constructor(private readonly creditDecisionService: CreditDecisionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credit decision' })
  @ApiResponse({ status: 201, description: 'Credit decision successfully created', type: CreditDecisionResponseDto })
  @ApiResponse({ status: 403, description: 'Credit request already has a decision' })
  async create(@Body() createCreditDecisionDto: CreateCreditDecisionDto): Promise<CreditDecisionResponseDto> {
    return this.creditDecisionService.create(createCreditDecisionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credit decisions' })
  @ApiResponse({ status: 200, description: 'Credit decisions retrieved successfully', type: [CreditDecisionResponseDto] })
  async findAll(): Promise<CreditDecisionResponseDto[]> {
    return this.creditDecisionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit decision by ID' })
  @ApiParam({ name: 'id', description: 'Credit decision ID' })
  @ApiResponse({ status: 200, description: 'Credit decision retrieved successfully', type: CreditDecisionResponseDto })
  @ApiResponse({ status: 404, description: 'Credit decision not found' })
  async findOne(@Param('id') id: string): Promise<CreditDecisionResponseDto> {
    return this.creditDecisionService.findOne(id);
  }

  @Get('credit-request/:creditRequestId')
  @ApiOperation({ summary: 'Get credit decision by credit request ID' })
  @ApiParam({ name: 'creditRequestId', description: 'Credit request ID' })
  @ApiResponse({ status: 200, description: 'Credit decision retrieved successfully', type: CreditDecisionResponseDto })
  @ApiResponse({ status: 404, description: 'Credit decision not found' })
  async findByCreditRequestId(@Param('creditRequestId') creditRequestId: string): Promise<CreditDecisionResponseDto> {
    return this.creditDecisionService.findByCreditRequestId(creditRequestId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update credit decision' })
  @ApiParam({ name: 'id', description: 'Credit decision ID' })
  @ApiResponse({ status: 200, description: 'Credit decision successfully updated', type: CreditDecisionResponseDto })
  @ApiResponse({ status: 404, description: 'Credit decision not found' })
  async update(@Param('id') id: string, @Body() updateCreditDecisionDto: UpdateCreditDecisionDto): Promise<CreditDecisionResponseDto> {
    return this.creditDecisionService.update(id, updateCreditDecisionDto);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept credit decision' })
  @ApiParam({ name: 'id', description: 'Credit decision ID' })
  @ApiResponse({ status: 200, description: 'Decision successfully accepted', type: CreditDecisionResponseDto })
  @ApiResponse({ status: 403, description: 'Decision already accepted or expired' })
  async acceptDecision(@Param('id') id: string): Promise<CreditDecisionResponseDto> {
    return this.creditDecisionService.acceptDecision(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete credit decision' })
  @ApiParam({ name: 'id', description: 'Credit decision ID' })
  @ApiResponse({ status: 200, description: 'Credit decision successfully deleted' })
  @ApiResponse({ status: 404, description: 'Credit decision not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.creditDecisionService.remove(id);
  }
}
