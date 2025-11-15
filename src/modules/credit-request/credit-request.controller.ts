import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreditRequestService } from './credit-request.service';
import { CreateCreditRequestDto, UpdateCreditRequestDto, CreditRequestResponseDto, CreditRequestListQueryDto } from './dto/credit-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/types/request.interface';

@ApiTags('credit-requests')
@UseGuards(JwtAuthGuard)
@Controller('credit-requests')
export class CreditRequestController {
  constructor(private readonly creditRequestService: CreditRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credit request' })
  @ApiResponse({ status: 201, description: 'Credit request successfully created', type: CreditRequestResponseDto })
  @ApiResponse({ status: 403, description: 'User must have a financial profile' })
  async create(@Req() req: AuthenticatedRequest, @Body() createCreditRequestDto: CreateCreditRequestDto): Promise<CreditRequestResponseDto> {
    const userId = req.user.id;
    return this.creditRequestService.create(userId, createCreditRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credit requests' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiResponse({ status: 200, description: 'Credit requests retrieved successfully' })
  async findAll(@Query() query: CreditRequestListQueryDto) {
    return this.creditRequestService.findAll(query);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current user credit requests' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'User credit requests retrieved successfully' })
  async findMyRequests(@Req() req: AuthenticatedRequest, @Query() query: CreditRequestListQueryDto) {
    const userId = req.user.id;
    return this.creditRequestService.findUserRequests(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit request by ID' })
  @ApiParam({ name: 'id', description: 'Credit request ID' })
  @ApiResponse({ status: 200, description: 'Credit request retrieved successfully', type: CreditRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Credit request not found' })
  async findOne(@Param('id') id: string): Promise<CreditRequestResponseDto> {
    return this.creditRequestService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update credit request' })
  @ApiParam({ name: 'id', description: 'Credit request ID' })
  @ApiResponse({ status: 200, description: 'Credit request successfully updated', type: CreditRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Credit request not found' })
  async update(@Param('id') id: string, @Body() updateCreditRequestDto: UpdateCreditRequestDto): Promise<CreditRequestResponseDto> {
    return this.creditRequestService.update(id, updateCreditRequestDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update credit request status' })
  @ApiParam({ name: 'id', description: 'Credit request ID' })
  @ApiResponse({ status: 200, description: 'Status successfully updated', type: CreditRequestResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reviewedAt') reviewedAt?: Date
  ): Promise<CreditRequestResponseDto> {
    return this.creditRequestService.updateStatus(id, status, reviewedAt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete credit request' })
  @ApiParam({ name: 'id', description: 'Credit request ID' })
  @ApiResponse({ status: 200, description: 'Credit request successfully deleted' })
  @ApiResponse({ status: 404, description: 'Credit request not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.creditRequestService.remove(id);
  }
}
