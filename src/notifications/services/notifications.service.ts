import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationsRepository: Repository<Notification>,
    ) { }

    async createNotification(
        userId: string,
        type: NotificationType,
        data: Record<string, any>,
    ): Promise<Notification> {
        const notification = this.notificationsRepository.create({
            userId,
            type,
            data,
            read: false,
        });

        return this.notificationsRepository.save(notification);
    }

    private readonly logger = new Logger(NotificationsService.name);

    async getUserNotifications(
        userId: string,
        limit: number = 50,
        offset: number = 0,
    ): Promise<[NotificationResponseDto[], number]> {
        this.logger.debug(`Fetching notifications for User: ${userId} | Limit: ${limit}`);
        const [notifications, total] = await this.notificationsRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });

        return [notifications.map((n) => new NotificationResponseDto(n)), total];
    }

    async markAsRead(notificationId: string): Promise<void> {
        await this.notificationsRepository.update(
            { id: notificationId },
            { read: true },
        );
        this.logger.log(`Notification marked as read | ID: ${notificationId}`);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationsRepository.count({
            where: { userId, read: false },
        });
    }
}
