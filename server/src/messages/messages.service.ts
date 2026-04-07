import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async findById(id: string): Promise<MessageDocument | null> {
    return this.messageModel.findById(id).exec();
  }

  async create(
    dto: CreateMessageDto,
    senderId: string,
  ): Promise<MessageDocument> {
    const messageData: Partial<Message> = {
      channel: new Types.ObjectId(dto.channelId),
      sender: new Types.ObjectId(senderId),
      content: dto.content,
      type: 'text',
      attachments: dto.attachments || [],
      mentions: dto.mentions
        ? dto.mentions.map((id) => new Types.ObjectId(id))
        : [],
      thread: {
        parentMessage: dto.parentMessageId
          ? new Types.ObjectId(dto.parentMessageId)
          : null,
        replyCount: 0,
        lastReplyAt: null,
      },
    };

    if (dto.attachments && dto.attachments.length > 0) {
      const firstAttachment = dto.attachments[0];
      if (firstAttachment.fileType.startsWith('image/')) {
        messageData.type = 'image';
      } else {
        messageData.type = 'file';
      }
    }

    const message = await new this.messageModel(messageData).save();

    if (dto.parentMessageId) {
      await this.messageModel.findByIdAndUpdate(dto.parentMessageId, {
        $inc: { 'thread.replyCount': 1 },
        'thread.lastReplyAt': new Date(),
      });
    }

    const populated = await this.messageModel
      .findById(message._id)
      .populate('sender', 'displayName email avatar status')
      .populate('mentions', 'displayName')
      .exec();

    if (!populated) throw new NotFoundException('Message not found');
    return populated;
  }

  async findByChannel(
    channelId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<MessageDocument[]> {
    const query: Record<string, any> = {
      channel: new Types.ObjectId(channelId),
      deleted: false,
      'thread.parentMessage': null,
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    return this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'displayName email avatar status')
      .populate('mentions', 'displayName')
      .exec();
  }

  async findThreadReplies(parentMessageId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        'thread.parentMessage': new Types.ObjectId(parentMessageId),
        deleted: false,
      })
      .sort({ createdAt: 1 })
      .populate('sender', 'displayName email avatar status')
      .populate('mentions', 'displayName')
      .exec();
  }

  async update(
    messageId: string,
    content: string,
    userId: string,
  ): Promise<MessageDocument> {
    const message = await this.messageModel.findById(messageId).exec();

    if (!message) throw new NotFoundException('Message not found');
    if (message.sender.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const updated = await this.messageModel
      .findById(messageId)
      .populate('sender', 'displayName email avatar status')
      .populate('mentions', 'displayName')
      .exec();

    if (!updated) throw new NotFoundException('Message not found');
    return updated;
  }

  async delete(messageId: string, userId: string): Promise<MessageDocument> {
    const message = await this.messageModel.findById(messageId).exec();

    if (!message) throw new NotFoundException('Message not found');
    if (message.sender.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.deleted = true;
    message.content = '';
    await message.save();

    const deleted = await this.messageModel
      .findById(messageId)
      .populate('sender', 'displayName email avatar status')
      .exec();

    if (!deleted) throw new NotFoundException('Message not found');
    return deleted;
  }

  async addReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<MessageDocument> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) throw new NotFoundException('Message not found');

    const userObjectId = new Types.ObjectId(userId);
    const existing = message.reactions.find((r) => r.emoji === emoji);

    if (existing) {
      const hasReacted = existing.users.some(
        (u) => u.toString() === userId,
      );
      if (hasReacted) {
        existing.users = existing.users.filter(
          (u) => u.toString() !== userId,
        ) as Types.ObjectId[];
        if (existing.users.length === 0) {
          message.reactions = message.reactions.filter(
            (r) => r.emoji !== emoji,
          );
        }
      } else {
        existing.users.push(userObjectId);
      }
    } else {
      message.reactions.push({ emoji, users: [userObjectId] });
    }

    await message.save();

    const updated = await this.messageModel
      .findById(messageId)
      .populate('sender', 'displayName email avatar status')
      .exec();

    if (!updated) throw new NotFoundException('Message not found');
    return updated;
  }

  async removeReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<MessageDocument> {
    return this.addReaction(messageId, emoji, userId);
  }

  async search(
    workspaceId: string,
    query: string,
    channelIds: string[],
  ): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        channel: { $in: channelIds.map((id) => new Types.ObjectId(id)) },
        $text: { $search: query },
        deleted: false,
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(50)
      .populate('sender', 'displayName email avatar')
      .populate('channel', 'name type')
      .exec();
  }
}
