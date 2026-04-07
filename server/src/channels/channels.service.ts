import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Channel, ChannelDocument } from './schemas/channel.schema';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    private workspacesService: WorkspacesService,
  ) {}

  async create(
    dto: CreateChannelDto,
    userId: string,
  ): Promise<ChannelDocument> {
    const workspace = await this.workspacesService.findById(dto.workspaceId);
    const role = this.workspacesService.getMemberRole(workspace, userId);

    if (!role || role === 'guest') {
      throw new ForbiddenException('Guests cannot create channels');
    }

    const existing = await this.channelModel
      .findOne({
        workspace: new Types.ObjectId(dto.workspaceId),
        name: dto.name.toLowerCase(),
      })
      .exec();

    if (existing) {
      throw new ConflictException('A channel with this name already exists');
    }

    const channel = new this.channelModel({
      workspace: new Types.ObjectId(dto.workspaceId),
      name: dto.name.toLowerCase(),
      description: dto.description || '',
      type: dto.type || 'public',
      category: dto.category || '',
      createdBy: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
    });

    return channel.save();
  }

  async findByWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<ChannelDocument[]> {
    const workspace = await this.workspacesService.findById(workspaceId);
    const role = this.workspacesService.getMemberRole(workspace, userId);

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const userObjectId = new Types.ObjectId(userId);

    if (role === 'owner' || role === 'admin') {
      return this.channelModel
        .find({ workspace: new Types.ObjectId(workspaceId) })
        .populate('createdBy', 'displayName avatar')
        .sort({ category: 1, name: 1 })
        .exec();
    }

    return this.channelModel
      .find({
        workspace: new Types.ObjectId(workspaceId),
        $or: [{ type: 'public' }, { members: userObjectId }],
      })
      .populate('createdBy', 'displayName avatar')
      .sort({ category: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<ChannelDocument> {
    const channel = await this.channelModel
      .findById(id)
      .populate('members', 'displayName email avatar status')
      .populate('createdBy', 'displayName avatar')
      .exec();

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return channel;
  }

  async update(
    id: string,
    dto: UpdateChannelDto,
    userId: string,
  ): Promise<ChannelDocument> {
    const channel = await this.findById(id);
    const workspace = await this.workspacesService.findById(
      channel.workspace.toString(),
    );

    const role = this.workspacesService.getMemberRole(workspace, userId);
    const isCreator = channel.createdBy.toString() === userId;

    if (!isCreator && role !== 'owner' && role !== 'admin') {
      throw new ForbiddenException('Only channel creator or admins can update');
    }

    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name.toLowerCase();
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.topic !== undefined) updateData.topic = dto.topic;
    if (dto.category !== undefined) updateData.category = dto.category;

    const updated = await this.channelModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('members', 'displayName email avatar status')
      .populate('createdBy', 'displayName avatar')
      .exec();

    if (!updated) throw new NotFoundException('Channel not found');
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const channel = await this.findById(id);
    const workspace = await this.workspacesService.findById(
      channel.workspace.toString(),
    );

    const role = this.workspacesService.getMemberRole(workspace, userId);

    if (role !== 'owner' && role !== 'admin') {
      throw new ForbiddenException('Only workspace owner or admin can delete channels');
    }

    await this.channelModel.findByIdAndDelete(id).exec();
  }

  async join(id: string, userId: string): Promise<ChannelDocument> {
    const channel = await this.findById(id);

    if (channel.type === 'private') {
      throw new ForbiddenException('Cannot join a private channel without invite');
    }

    const isMember = channel.members.some(
      (m) => m.toString() === userId,
    );
    if (isMember) {
      throw new ConflictException('Already a member of this channel');
    }

    channel.members.push(new Types.ObjectId(userId));
    return channel.save();
  }

  async leave(id: string, userId: string): Promise<ChannelDocument> {
    const channel = await this.findById(id);

    channel.members = channel.members.filter(
      (m) => m.toString() !== userId,
    ) as Types.ObjectId[];
    return channel.save();
  }

  async getMembers(id: string): Promise<ChannelDocument> {
    const channel = await this.channelModel
      .findById(id)
      .populate('members', 'displayName email avatar status customStatus lastSeen')
      .exec();

    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }

  async pinMessage(
    channelId: string,
    messageId: string,
    userId: string,
  ): Promise<ChannelDocument> {
    const channel = await this.findById(channelId);
    const workspace = await this.workspacesService.findById(
      channel.workspace.toString(),
    );
    const role = this.workspacesService.getMemberRole(workspace, userId);

    if (!role || role === 'guest') {
      throw new ForbiddenException('Guests cannot pin messages');
    }

    const msgObjectId = new Types.ObjectId(messageId);
    const isPinned = channel.pinnedMessages.some(
      (m) => m.toString() === messageId,
    );

    if (isPinned) {
      channel.pinnedMessages = channel.pinnedMessages.filter(
        (m) => m.toString() !== messageId,
      ) as Types.ObjectId[];
    } else {
      channel.pinnedMessages.push(msgObjectId);
    }

    return channel.save();
  }

  async createDefaultChannel(
    workspaceId: string,
    userId: string,
  ): Promise<ChannelDocument> {
    const channel = new this.channelModel({
      workspace: new Types.ObjectId(workspaceId),
      name: 'general',
      description: 'General discussion',
      type: 'public',
      category: '',
      createdBy: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
    });

    return channel.save();
  }
}
