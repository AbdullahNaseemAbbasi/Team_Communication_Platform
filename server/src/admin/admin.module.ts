import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import {
  Workspace,
  WorkspaceSchema,
} from '../workspaces/schemas/workspace.schema';
import { Channel, ChannelSchema } from '../channels/schemas/channel.schema'; 
import { User, UserSchema } from '../users/schemas/user.schema'; 
import { WorkspacesModule } from '../workspaces/workspaces.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WorkspacesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
