import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3002',
    ],
    credentials: true,
  },
})
export class CallGateway {
  @WebSocketServer()
  server!: Server;

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
    const call = this.activeCalls.get(data.callId);
    if (!call) return;

    const callerSockets = this.findSocketsByUserId(call.callerId);
    for (const socketId of callerSockets) {
      this.server.to(socketId).emit('call:accepted', {
        callId: data.callId,
        acceptedBy: client.data.userId,
      });
    }
  }

  @SubscribeMessage('call:reject')
  handleReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    const call = this.activeCalls.get(data.callId);
    if (!call) return;

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
    const call = this.activeCalls.get(data.callId);
    if (!call) return;

    const otherUserId =
      client.data.userId === call.callerId
        ? call.receiverId
        : call.callerId;

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
    const targetSockets = this.findSocketsByUserId(data.targetUserId);
    for (const socketId of targetSockets) {
      this.server.to(socketId).emit('call:signal', {
        callId: data.callId,
        fromUserId: client.data.userId,
        signal: data.signal,
      });
    }
  }
}
