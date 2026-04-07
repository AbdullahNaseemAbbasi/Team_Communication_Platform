import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex');
  }

  async create(
    dto: CreateWorkspaceDto,
    userId: string,
  ): Promise<WorkspaceDocument> {
    let slug = this.generateSlug(dto.name);

    const existing = await this.workspaceModel.findOne({ slug }).exec();
    if (existing) {
      slug = `${slug}-${randomBytes(2).toString('hex')}`;
    }

    const workspace = new this.workspaceModel({
      name: dto.name,
      slug,
      description: dto.description || '',
      owner: new Types.ObjectId(userId),
      members: [
        {
          user: new Types.ObjectId(userId),
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      inviteCode: this.generateInviteCode(),
      settings: {
        defaultChannel: null,
        fileUploadLimit: 10 * 1024 * 1024,
        allowGuests: true,
      },
    });

    return workspace.save();
  }

  async findUserWorkspaces(userId: string): Promise<WorkspaceDocument[]> {
    return this.workspaceModel
      .find({ 'members.user': new Types.ObjectId(userId) })
      .populate('owner', 'displayName email avatar')
      .populate('members.user', 'displayName email avatar status')
      .exec();
  }

  async findById(id: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel
      .findById(id)
      .populate('owner', 'displayName email avatar')
      .populate('members.user', 'displayName email avatar status')
      .exec();

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(
    id: string,
    dto: UpdateWorkspaceDto,
    userId: string,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.findById(id);
    this.checkRole(workspace, userId, ['owner', 'admin']);

    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.logo !== undefined) updateData.logo = dto.logo;
    if (dto.allowGuests !== undefined)
      updateData['settings.allowGuests'] = dto.allowGuests;
    if (dto.fileUploadLimit !== undefined)
      updateData['settings.fileUploadLimit'] = dto.fileUploadLimit;

    const updated = await this.workspaceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('owner', 'displayName email avatar')
      .populate('members.user', 'displayName email avatar status')
      .exec();

    if (!updated) throw new NotFoundException('Workspace not found');
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const workspace = await this.findById(id);
    this.checkRole(workspace, userId, ['owner']);

    await this.workspaceModel.findByIdAndDelete(id).exec();
  }

  async regenerateInviteCode(
    id: string,
    userId: string,
  ): Promise<{ inviteCode: string }> {
    const workspace = await this.findById(id);
    this.checkRole(workspace, userId, ['owner', 'admin']);

    const inviteCode = this.generateInviteCode();
    await this.workspaceModel.findByIdAndUpdate(id, { inviteCode }).exec();

    return { inviteCode };
  }

  async joinByInviteCode(
    inviteCode: string,
    userId: string,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel
      .findOne({ inviteCode })
      .exec();

    if (!workspace) {
      throw new NotFoundException('Invalid invite code');
    }

    const isMember = workspace.members.some(
      (m) => m.user.toString() === userId,
    );
    if (isMember) {
      throw new ConflictException('Already a member of this workspace');
    }

    workspace.members.push({
      user: new Types.ObjectId(userId),
      role: 'member',
      joinedAt: new Date(),
    });

    return workspace.save();
  }

  async changeMemberRole(
    workspaceId: string,
    targetUserId: string,
    role: string,
    requesterId: string,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.findById(workspaceId);
    this.checkRole(workspace, requesterId, ['owner', 'admin']);

    if (workspace.owner.toString() === targetUserId && role !== 'owner') {
      throw new ForbiddenException('Cannot change the owner role');
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === targetUserId,
    );
    if (!member) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    const requester = workspace.members.find(
      (m) => m.user.toString() === requesterId,
    );
    if (requester?.role === 'admin' && (role === 'owner' || role === 'admin')) {
      throw new ForbiddenException('Admins cannot assign owner or admin roles');
    }

    member.role = role as 'owner' | 'admin' | 'member' | 'guest';
    return workspace.save();
  }

  async removeMember(
    workspaceId: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.findById(workspaceId);
    this.checkRole(workspace, requesterId, ['owner', 'admin']);

    if (workspace.owner.toString() === targetUserId) {
      throw new ForbiddenException('Cannot remove the workspace owner');
    }

    const requester = workspace.members.find(
      (m) => m.user.toString() === requesterId,
    );
    const target = workspace.members.find(
      (m) => m.user.toString() === targetUserId,
    );

    if (!target) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    if (requester?.role === 'admin' && target.role === 'admin') {
      throw new ForbiddenException('Admins cannot remove other admins');
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== targetUserId,
    );
    return workspace.save();
  }

  getMemberRole(
    workspace: WorkspaceDocument,
    userId: string,
  ): string | null {
    const member = workspace.members.find((m) => {
      const u = m.user as any;
      const memberId = u?._id ? u._id.toString() : String(u);
      return memberId === userId;
    });
    return member ? member.role : null;
  }

  private checkRole(
    workspace: WorkspaceDocument,
    userId: string,
    allowedRoles: string[],
  ): void {
    const role = this.getMemberRole(workspace, userId);

    if (!role) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(
        `This action requires one of: ${allowedRoles.join(', ')}`,
      );
    }
  }
}
