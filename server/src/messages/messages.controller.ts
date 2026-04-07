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
import { MessagesService } from './messages.service';
import { ChannelsService } from '../channels/channels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private channelsService: ChannelsService,
  ) {}

  @Get()
  findByChannel(
    @Query('channelId') channelId: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: string,
  ) {
    return this.messagesService.findByChannel(
      channelId,
      cursor || undefined,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post()
  create(@Body() dto: CreateMessageDto, @Request() req: any) {
    return this.messagesService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.messagesService.update(id, content, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.delete(id, req.user.id);
  }

  @Post(':id/reactions')
  addReaction(
    @Param('id') id: string,
    @Body('emoji') emoji: string,
    @Request() req: any,
  ) {
    return this.messagesService.addReaction(id, emoji, req.user.id);
  }

  @Delete(':id/reactions/:emoji')
  removeReaction(
    @Param('id') id: string,
    @Param('emoji') emoji: string,
    @Request() req: any,
  ) {
    return this.messagesService.removeReaction(id, emoji, req.user.id);
  }

  @Get(':id/thread')
  getThread(@Param('id') id: string) {
    return this.messagesService.findThreadReplies(id);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('workspaceId') workspaceId: string,
    @Request() req: any,
  ) {
    const channels = await this.channelsService.findByWorkspace(
      workspaceId,
      req.user.id,
    );
    const channelIds = channels.map((c) => c._id.toString());
    return this.messagesService.search(workspaceId, query, channelIds);
  }
}
