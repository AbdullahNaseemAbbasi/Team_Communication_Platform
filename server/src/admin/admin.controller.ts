import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private workspacesService: WorkspacesService,
  ) {}

  private async checkAdminAccess(workspaceId: string, userId: string) {
    const workspace = await this.workspacesService.findById(workspaceId);
    const role = this.workspacesService.getMemberRole(workspace, userId);
    if (role !== 'owner' && role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get(':workspaceId/analytics')
  async getAnalytics(
    @Param('workspaceId') workspaceId: string,
    @Request() req: any,
  ) {
    await this.checkAdminAccess(workspaceId, req.user.id);
    return this.adminService.getWorkspaceAnalytics(workspaceId);
  }

  @Get(':workspaceId/audit-log')
  async getAuditLog(
    @Param('workspaceId') workspaceId: string,
    @Query('limit') limit: string,
    @Request() req: any,
  ) {
    await this.checkAdminAccess(workspaceId, req.user.id);
    return this.adminService.getAuditLog(
      workspaceId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get(':workspaceId/storage')
  async getStorage(
    @Param('workspaceId') workspaceId: string,
    @Request() req: any,
  ) {
    await this.checkAdminAccess(workspaceId, req.user.id);
    return this.adminService.getStorageUsage(workspaceId);
  }
}
