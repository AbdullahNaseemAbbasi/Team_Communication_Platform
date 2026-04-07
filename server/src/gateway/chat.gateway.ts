import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChannelsService } from '../channels/channels.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private channelsService: ChannelsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      client.data.userId = userId;

      const existing = this.userSockets.get(userId) || [];
      existing.push(client.id);
      this.userSockets.set(userId, existing);

      await this.usersService.updateById(userId, { status: 'online' });

      this.server.emit('user:status-change', {
        userId,
        status: 'online',
      });
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    const sockets = this.userSockets.get(userId) || [];
    const remaining = sockets.filter((id) => id !== client.id);

    if (remaining.length === 0) {
      this.userSockets.delete(userId);

      await this.usersService.updateById(userId, {
        status: 'offline',
        lastSeen: new Date(),
      } as any);

      this.server.emit('user:status-change', {
        userId,
        status: 'offline',
      });
    } else {
      this.userSockets.set(userId, remaining);
    }
  }

  @SubscribeMessage('channel:join')
  handleChannelJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.join(`channel:${data.channelId}`);
  }

  @SubscribeMessage('channel:leave')
  handleChannelLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.leave(`channel:${data.channelId}`);
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      channelId: string;
      content: string;
      parentMessageId?: string;
      attachments?: any[];
      mentions?: string[];
    },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const message = await this.messagesService.create(
      {
        channelId: data.channelId,
        content: data.content,
        parentMessageId: data.parentMessageId,
        attachments: data.attachments,
        mentions: data.mentions,
      },
      userId,
    );

    this.server
      .to(`channel:${data.channelId}`)
      .emit('message:new', message);

    if (data.parentMessageId) {
      this.server
        .to(`channel:${data.channelId}`)
        .emit('thread:updated', {
          parentMessageId: data.parentMessageId,
          reply: message,
        });
    }

    try {
      const sender = await this.usersService.findById(userId);
      const channel = await this.channelsService.findById(data.channelId);
      const senderName = sender?.displayName || 'Someone';
      const channelName = channel?.name || 'a channel';
      const workspaceId = channel.workspace.toString();
      const messageId = (message as any)._id.toString();

      if (data.mentions && data.mentions.length > 0) {
        const mentionIds = data.mentions.filter((id) => id !== userId);
        await this.notificationsService.createForMentions(
          mentionIds,
          senderName,
          channelName,
          data.content,
          workspaceId,
          data.channelId,
          messageId,
        );

        for (const mentionedUserId of mentionIds) {
          const sockets = this.userSockets.get(mentionedUserId);
          if (sockets) {
            for (const socketId of sockets) {
              this.server.to(socketId).emit('notification:new', {
                type: 'mention',
                title: `${senderName} mentioned you`,
                body: `In #${channelName}: ${data.content.slice(0, 100)}`,
              });
            }
          }
        }
      }

      if (data.parentMessageId) {
        const parentMsg = await this.messagesService.findById(data.parentMessageId);
        if (parentMsg && parentMsg.sender.toString() !== userId) {
          const parentSenderId = parentMsg.sender.toString();
          await this.notificationsService.createForReply(
            parentSenderId,
            senderName,
            channelName,
            data.content,
            workspaceId,
            data.channelId,
            messageId,
          );

          const sockets = this.userSockets.get(parentSenderId);
          if (sockets) {
            for (const socketId of sockets) {
              this.server.to(socketId).emit('notification:new', {
                type: 'reply',
                title: `${senderName} replied to your message`,
                body: `In #${channelName}: ${data.content.slice(0, 100)}`,
              });
            }
          }
        }
      }
    } catch {}
  }

  @SubscribeMessage('message:edit')
  async handleMessageEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const message = await this.messagesService.update(
      data.messageId,
      data.content,
      userId,
    );

    const channelId = message.channel.toString();
    this.server
      .to(`channel:${channelId}`)
      .emit('message:updated', message);
  }

  @SubscribeMessage('message:delete')
  async handleMessageDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const message = await this.messagesService.delete(
      data.messageId,
      userId,
    );

    const channelId = message.channel.toString();
    this.server.to(`channel:${channelId}`).emit('message:deleted', {
      messageId: data.messageId,
      channelId,
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    const userId = client.data.userId;
    client.to(`channel:${data.channelId}`).emit('user:typing', {
      userId,
      channelId: data.channelId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    const userId = client.data.userId;
    client.to(`channel:${data.channelId}`).emit('user:typing', {
      userId,
      channelId: data.channelId,
      isTyping: false,
    });
  }

  @SubscribeMessage('message:reaction')
  async handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const message = await this.messagesService.addReaction(
      data.messageId,
      data.emoji,
      userId,
    );

    const channelId = message.channel.toString();
    this.server
      .to(`channel:${channelId}`)
      .emit('message:updated', message);
  }
}
