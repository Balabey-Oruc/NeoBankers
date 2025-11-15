import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error', 'credit_update', 'payment_reminder', 'approval', 'rejection'])
  type?: 'info' | 'success' | 'warning' | 'error' | 'credit_update' | 'payment_reminder' | 'approval' | 'rejection';

  @IsOptional()
  @IsEnum(['in_app', 'email', 'sms', 'push'])
  channel?: 'in_app' | 'email' | 'sms' | 'push';

  @IsOptional()
  metadata?: any;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error', 'credit_update', 'payment_reminder'])
  type?: 'info' | 'success' | 'warning' | 'error' | 'credit_update' | 'payment_reminder';

  @IsOptional()
  isRead?: boolean;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  scheduledAt?: Date;

  @IsOptional()
  @IsEnum(['in_app', 'email', 'sms', 'push'])
  channel?: 'in_app' | 'email' | 'sms' | 'push';
}

export class NotificationResponseDto {
  id: string;
  userId: string;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class BulkNotificationDto {
  @IsArray()
  userIds: string[];

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error', 'credit_update', 'payment_reminder'])
  type?: 'info' | 'success' | 'warning' | 'error' | 'credit_update' | 'payment_reminder';

  @IsOptional()
  @IsEnum(['in_app', 'email', 'sms', 'push'])
  channel?: 'in_app' | 'email' | 'sms' | 'push';

  @IsOptional()
  metadata?: any;
}

export class NotificationListQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error', 'credit_update', 'payment_reminder', 'approval', 'rejection'])
  type?: 'info' | 'success' | 'warning' | 'error' | 'credit_update' | 'payment_reminder' | 'approval' | 'rejection';

  @IsOptional()
  isRead?: boolean;

  @IsOptional()
  @IsEnum(['in_app', 'email', 'sms', 'push'])
  channel?: 'in_app' | 'email' | 'sms' | 'push';

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
