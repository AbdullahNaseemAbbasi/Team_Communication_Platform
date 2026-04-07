import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    recipientId: string;
    type: string;
    title: string;
    body: string;
    workspaceId?: string;
    channelId?: string;
    messageId?: string;
  }): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      recipient: new Types.ObjectId(data.recipientId),
      type: data.type,
      title: data.title,
      body: data.body,
      data: {
        workspace: data.workspaceId
          ? new Types.ObjectId(data.workspaceId)
          : null,
        channel: data.channelId
          ? new Types.ObjectId(data.channelId)
          : null,
        message: data.messageId
          ? new Types.ObjectId(data.messageId)
          : null,
      },
      read: false,
    });

    return notification.save();
  }

  async createForMentions(
    mentionedUserIds: string[],
    senderName: string,
    channelName: string,
    content: string,
    workspaceId: string,
    channelId: string,
    messageId: string,
  ): Promise<void> {
    const notifications = mentionedUserIds.map((userId) => ({
      recipient: new Types.ObjectId(userId),
      type: 'mention',
      title: `${senderName} mentioned you`,
      body: `In #${channelName}: ${content.slice(0, 100)}`,
      data: {
        workspace: new Types.ObjectId(workspaceId),
        channel: new Types.ObjectId(channelId),
        message: new Types.ObjectId(messageId),
      },
      read: false,
    }));

    if (notifications.length > 0) {
      await this.notificationModel.insertMany(notifications);
    }
  }

  async createForReply(
    parentMessageSenderId: string,
    replierName: string,
    channelName: string,
    content: string,
    workspaceId: string,
    channelId: string,
    messageId: string,
  ): Promise<NotificationDocument> {
    return this.create({
      recipientId: parentMessageSenderId,
      type: 'reply',
      title: `${replierName} replied to your message`,
      body: `In #${channelName}: ${content.slice(0, 100)}`,
      workspaceId,
      channelId,
      messageId,
    });
  }

  async findByUser(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<NotificationDocument[]> {
    const query: Record<string, any> = {
      recipient: new Types.ObjectId(userId),
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({
        recipient: new Types.ObjectId(userId),
        read: false,
      })
      .exec();
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(notificationId),
          recipient: new Types.ObjectId(userId),
        },
        { read: true },
        { new: true },
      )
      .exec();

    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { recipient: new Types.ObjectId(userId), read: false },
        { read: true },
      )
      .exec();
  }
}
