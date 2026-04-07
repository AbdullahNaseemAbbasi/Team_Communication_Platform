import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Channel', required: true, index: true })
  channel: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: ['text', 'image', 'file', 'system'], default: 'text' })
  type: string;

  @Prop({
    type: [
      raw({
        url: String,
        filename: String,
        fileType: String,
        size: Number,
      }),
    ],
    default: [],
  })
  attachments: {
    url: string;
    filename: string;
    fileType: string;
    size: number;
  }[];

  @Prop({
    type: [
      raw({
        emoji: String,
        users: [{ type: Types.ObjectId, ref: 'User' }],
      }),
    ],
    default: [],
  })
  reactions: {
    emoji: string;
    users: Types.ObjectId[];
  }[];

  @Prop(
    raw({
      parentMessage: { type: Types.ObjectId, ref: 'Message', default: null },
      replyCount: { type: Number, default: 0 },
      lastReplyAt: { type: Date, default: null },
    }),
  )
  thread: {
    parentMessage: Types.ObjectId | null;
    replyCount: number;
    lastReplyAt: Date | null;
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mentions: Types.ObjectId[];

  @Prop({ default: false })
  edited: boolean;

  @Prop({ default: null })
  editedAt: Date;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({
    type: [
      raw({
        user: { type: Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      }),
    ],
    default: [],
  })
  readBy: {
    user: Types.ObjectId;
    readAt: Date;
  }[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ channel: 1, createdAt: -1 });
MessageSchema.index({ content: 'text' });
