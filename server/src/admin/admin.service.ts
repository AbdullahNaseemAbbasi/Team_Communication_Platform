import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../messages/schemas/message.schema';
import {
  Workspace,
  WorkspaceDocument,
} from '../workspaces/schemas/workspace.schema';
import { Channel, ChannelDocument } from '../channels/schemas/channel.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getWorkspaceAnalytics(workspaceId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) return null;

    const totalMembers = workspace.members.length;
    const onlineMembers = await this.userModel
      .countDocuments({
        _id: {
          $in: workspace.members.map((m) => m.user),
        },
        status: 'online',
      })
      .exec();

    const channels = await this.channelModel
      .find({ workspace: new Types.ObjectId(workspaceId) })
      .exec();
    const totalChannels = channels.length;
    const channelIds = channels.map((c) => c._id);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messagesPerDay = await this.messageModel
      .aggregate([
        {
          $match: {
            channel: { $in: channelIds },
            createdAt: { $gte: sevenDaysAgo },
            deleted: false,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    const totalMessages = await this.messageModel
      .countDocuments({
        channel: { $in: channelIds },
        deleted: false,
      })
      .exec();

    const popularChannels = await this.messageModel
      .aggregate([
        {
          $match: {
            channel: { $in: channelIds },
            createdAt: { $gte: sevenDaysAgo },
            deleted: false,
          },
        },
        {
          $group: {
            _id: '$channel',
            messageCount: { $sum: 1 },
          },
        },
        { $sort: { messageCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'channels',
            localField: '_id',
            foreignField: '_id',
            as: 'channel',
          },
        },
        { $unwind: '$channel' },
        {
          $project: {
            name: '$channel.name',
            type: '$channel.type',
            messageCount: 1,
          },
        },
      ])
      .exec();

    return {
      totalMembers,
      onlineMembers,
      totalChannels,
      totalMessages,
      messagesPerDay,
      popularChannels,
    };
  }

  async getAuditLog(workspaceId: string, limit: number = 50) {
    return [];
  }

  async getStorageUsage(workspaceId: string) {
    const channels = await this.channelModel
      .find({ workspace: new Types.ObjectId(workspaceId) })
      .exec();
    const channelIds = channels.map((c) => c._id);

    const storageData = await this.messageModel
      .aggregate([
        {
          $match: {
            channel: { $in: channelIds },
            'attachments.0': { $exists: true },
          },
        },
        { $unwind: '$attachments' },
        {
          $group: {
            _id: null,
            totalSize: { $sum: '$attachments.size' },
            fileCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    return {
      totalSize: storageData[0]?.totalSize || 0,
      fileCount: storageData[0]?.fileCount || 0,
      limit: 10 * 1024 * 1024 * 1024,
    };
  }
}
