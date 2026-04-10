import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
  },
})
export class CallGateway implements OnGatewayConnection {
  private readonly logger = new Logger(CallGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private jwtService: JwtService) {}

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
      client.data.userId = payload.sub;
    } catch (error) {
      this.logger.warn(`Call socket auth failed: ${error}`);
      client.disconnect();
    }
  }

  private activeCalls: Map<
    string,
    {
      callerId: string;
      receiverId: string;
      type: 'voice' | 'video';
      startedAt: Date;
    }
  > = new Map();

  private findSocketsByUserId(userId: string): string[] {
    const sockets: string[] = [];
    this.server.sockets.sockets.forEach((socket) => {
      if (socket.data.userId === userId) {
        sockets.push(socket.id);
      }
    });
    return sockets;
  }

  @SubscribeMessage('call:initiate')
  handleInitiate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { targetUserId: string; type: 'voice' | 'video' },
  ) {
    const callerId = client.data.userId;
    if (!callerId) return;

    const callId = `${callerId}-${data.targetUserId}-${Date.now()}`;

    this.activeCalls.set(callId, {
      callerId,
      receiverId: data.targetUserId,
      type: data.type,
      startedAt: new Date(),
    });

    const receiverSockets = this.findSocketsByUserId(data.targetUserId);
    for (const socketId of receiverSockets) {
      this.server.to(socketId).emit('call:incoming', {
        callId,
        callerId,
        type: data.type,
      });
    }

    client.emit('call:initiated', { callId });
  }

  @SubscribeMessage('call:accept')
  handleAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const call = this.activeCalls.get(data.callId);
    // Only the intended receiver can accept the call
    if (!call || call.receiverId !== userId) return;

    const callerSockets = this.findSocketsByUserId(call.callerId);
    for (const socketId of callerSockets) {
      this.server.to(socketId).emit('call:accepted', {
        callId: data.callId,
        acceptedBy: userId,
      });
    }
  }

  @SubscribeMessage('call:reject')
  handleReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const call = this.activeCalls.get(data.callId);
    // Only the intended receiver can reject the call
    if (!call || call.receiverId !== userId) return;

    const callerSockets = this.findSocketsByUserId(call.callerId);
    for (const socketId of callerSockets) {
      this.server.to(socketId).emit('call:rejected', {
        callId: data.callId,
      });
    }

    this.activeCalls.delete(data.callId);
  }

  @SubscribeMessage('call:end')
  handleEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const call = this.activeCalls.get(data.callId);
    // Only participants of the call can end it
    if (!call || (call.callerId !== userId && call.receiverId !== userId)) return;

    const otherUserId =
      userId === call.callerId ? call.receiverId : call.callerId;

    const otherSockets = this.findSocketsByUserId(otherUserId);
    for (const socketId of otherSockets) {
      this.server.to(socketId).emit('call:ended', {
        callId: data.callId,
      });
    }

    this.activeCalls.delete(data.callId);
  }

  @SubscribeMessage('call:signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { callId: string; targetUserId: string; signal: any },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const call = this.activeCalls.get(data.callId);
    // Only participants of the call can signal, and only to the other participant
    if (!call || (call.callerId !== userId && call.receiverId !== userId)) return;
    if (data.targetUserId !== call.callerId && data.targetUserId !== call.receiverId) return;

    const targetSockets = this.findSocketsByUserId(data.targetUserId);
    for (const socketId of targetSockets) {
      this.server.to(socketId).emit('call:signal', {
        callId: data.callId,
        fromUserId: userId,
        signal: data.signal,
      });
    }
  }
}
