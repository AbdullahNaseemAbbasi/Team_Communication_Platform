import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

export interface WorkspaceMember {
  user: Types.ObjectId;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joinedAt: Date;
}

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true, trim: true, maxlength: 50 })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: null })
  logo!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner!: Types.ObjectId;

  @Prop({
    type: [
      raw({
        user: { type: Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'guest'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
      }),
    ],
    default: [],
  })
  members!: WorkspaceMember[];

  @Prop({ unique: true })
  inviteCode!: string;

  @Prop(
    raw({
      defaultChannel: { type: Types.ObjectId, ref: 'Channel', default: null },
      fileUploadLimit: { type: Number, default: 10 * 1024 * 1024 },
      allowGuests: { type: Boolean, default: true },
    }),
  )
  settings!: {
    defaultChannel: Types.ObjectId | null;
    fileUploadLimit: number;
    allowGuests: boolean;
  };
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
