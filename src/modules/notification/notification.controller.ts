import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationResponseDto, BulkNotificationDto, NotificationListQueryDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/types/request.interface';

@ApiTags('notifications')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification successfully created', type: NotificationResponseDto })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationService.create(createNotificationDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create bulk notifications' })
  @ApiResponse({ status: 201, description: 'Bulk notifications successfully created', type: [NotificationResponseDto] })
  async createBulk(@Body() bulkNotificationDto: BulkNotificationDto): Promise<NotificationResponseDto[]> {
    return this.notificationService.createBulk(bulkNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by channel' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async findAll(@Query() query: NotificationListQueryDto) {
    return this.notificationService.findAll(query);
  }

  @Get('my-notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by channel' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  async getMyNotifications(@Req() req: AuthenticatedRequest, @Query() query: NotificationListQueryDto) {
    const userId = req.user.id;
    return this.notificationService.findUserNotifications(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get current user unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Req() req: AuthenticatedRequest): Promise<{ count: number }> {
    const userId = req.user.id;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully', type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification successfully updated', type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Patch(':id/mark-read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  async markAsRead(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(id);
  }

  @Patch(':id/mark-unread')
  @ApiOperation({ summary: 'Mark notification as unread' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as unread', type: NotificationResponseDto })
  async markAsUnread(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.markAsUnread(id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: AuthenticatedRequest): Promise<void> {
    const userId = req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification successfully deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.notificationService.remove(id);
  }
}
