import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './schemas/channel.schema';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    WorkspacesModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
