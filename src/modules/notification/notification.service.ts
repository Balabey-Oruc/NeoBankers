import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { CreateNotificationDto, UpdateNotificationDto, NotificationResponseDto, BulkNotificationDto, NotificationListQueryDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: createNotificationDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      isRead: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    return this.formatNotificationResponse(savedNotification);
  }

  async createBulk(bulkNotificationDto: BulkNotificationDto): Promise<NotificationResponseDto[]> {
    const { userIds, message, type, channel, metadata } = bulkNotificationDto;

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });

    if (users.length === 0) {
      throw new NotFoundException('No valid users found');
    }

    const notifications = users.map(user => 
      this.notificationRepository.create({
        userId: user.id,
        message,
        type,
        channel: channel || 'in_app',
        metadata,
        isRead: false,
      })
    );

    const savedNotifications = await this.notificationRepository.save(notifications);
    return savedNotifications.map(notification => this.formatNotificationResponse(notification));
  }

  async findAll(query: NotificationListQueryDto): Promise<{ notifications: NotificationResponseDto[]; total: number }> {
    const { userId, type, isRead, channel, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user');

    if (userId) {
      queryBuilder.where('notification.userId = :userId', { userId });
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (channel) {
      queryBuilder.andWhere('notification.channel = :channel', { channel });
    }

    queryBuilder.orderBy(`notification.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [notifications, total] = await queryBuilder.getManyAndCount();
    
    return {
      notifications: notifications.map(notification => this.formatNotificationResponse(notification)),
      total,
    };
  }

  async findUserNotifications(userId: string, query: NotificationListQueryDto): Promise<{ notifications: NotificationResponseDto[]; total: number }> {
    const { type, isRead, channel, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (channel) {
      queryBuilder.andWhere('notification.channel = :channel', { channel });
    }

    queryBuilder.orderBy(`notification.${sortBy}`, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [notifications, total] = await queryBuilder.getManyAndCount();
    
    return {
      notifications: notifications.map(notification => this.formatNotificationResponse(notification)),
      total,
    };
  }

  async findOne(id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.formatNotificationResponse(notification);
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.update(id, updateNotificationDto);
    const updatedNotification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    return this.formatNotificationResponse(updatedNotification!);
  }

  async markAsRead(id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.update(id, { isRead: true, readAt: new Date() });
    const updatedNotification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    return this.formatNotificationResponse(updatedNotification!);
  }

  async markAsUnread(id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.update(id, { isRead: false, readAt: undefined });
    const updatedNotification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    return this.formatNotificationResponse(updatedNotification!);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async remove(id: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  private formatNotificationResponse(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      message: notification.message,
      type: notification.type,
      channel: notification.channel,
      isRead: notification.isRead,
      readAt: notification.readAt,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
