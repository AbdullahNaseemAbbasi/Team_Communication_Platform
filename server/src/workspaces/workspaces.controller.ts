import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() dto: CreateWorkspaceDto, @Request() req: any) {
    return this.workspacesService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.workspacesService.findUserWorkspaces(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspacesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @Request() req: any,
  ) {
    return this.workspacesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.workspacesService.delete(id, req.user.id);
  }

  @Post(':id/invite')
  regenerateInvite(@Param('id') id: string, @Request() req: any) {
    return this.workspacesService.regenerateInviteCode(id, req.user.id);
  }

  @Post('join/:inviteCode')
  join(@Param('inviteCode') inviteCode: string, @Request() req: any) {
    return this.workspacesService.joinByInviteCode(inviteCode, req.user.id);
  }

  @Patch(':id/members/:userId/role')
  changeRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Request() req: any,
  ) {
    return this.workspacesService.changeMemberRole(id, userId, role, req.user.id);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.workspacesService.removeMember(id, userId, req.user.id);
  }
}
