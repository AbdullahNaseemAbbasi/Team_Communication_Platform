import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  getRoot(): { name: string; version: string; status: string } {
    return {
      name: 'TeamChat API',
      version: '1.0.0',
      status: 'running',
    };
  }

  @Get('health')
  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
  } {
    const dbState = this.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    return {
      status: dbState === 1 ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }
}
