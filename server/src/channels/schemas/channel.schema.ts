import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChannelDocument = Channel & Document;

@Schema({ timestamps: true })
export class Channel {
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 80 })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: '' })
  topic!: string;

  @Prop({ required: true, enum: ['public', 'private', 'dm'], default: 'public' })
  type!: string;

  @Prop({ default: '' })
  category!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }], default: [] })
  pinnedMessages!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
