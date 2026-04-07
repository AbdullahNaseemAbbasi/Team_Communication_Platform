import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Post()
  create(@Body() dto: CreateChannelDto, @Request() req: any) {
    return this.channelsService.create(dto, req.user.id);
  }

  @Get()
  findByWorkspace(
    @Query('workspaceId') workspaceId: string,
    @Request() req: any,
  ) {
    return this.channelsService.findByWorkspace(workspaceId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChannelDto,
    @Request() req: any,
  ) {
    return this.channelsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.channelsService.delete(id, req.user.id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Request() req: any) {
    return this.channelsService.join(id, req.user.id);
  }

  @Post(':id/leave')
  leave(@Param('id') id: string, @Request() req: any) {
    return this.channelsService.leave(id, req.user.id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.channelsService.getMembers(id);
  }

  @Post(':id/pin/:messageId')
  pinMessage(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @Request() req: any,
  ) {
    return this.channelsService.pinMessage(id, messageId, req.user.id);
  }
}
