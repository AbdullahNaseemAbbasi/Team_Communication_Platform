import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipient!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['mention', 'reply', 'invite', 'dm', 'system'],
  })
  type!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop(
    raw({
      workspace: { type: Types.ObjectId, ref: 'Workspace', default: null },
      channel: { type: Types.ObjectId, ref: 'Channel', default: null },
      message: { type: Types.ObjectId, ref: 'Message', default: null },
    }),
  )
  data!: {
    workspace: Types.ObjectId | null;
    channel: Types.ObjectId | null;
    message: Types.ObjectId | null;
  };

  @Prop({ default: false })
  read!: boolean;
}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1 });
