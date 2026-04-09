import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ type: String, default: null })
  password!: string | null;

  @Prop({ type: String, required: true, trim: true })
  displayName!: string;

  @Prop({ type: String, default: null })
  avatar!: string | null;

  @Prop({ type: String, enum: ['online', 'offline', 'away', 'dnd'], default: 'offline' })
  status!: string;

  @Prop({ type: String, default: null })
  customStatus!: string | null;

  @Prop({ type: Date, default: null })
  lastSeen!: Date | null;

  @Prop({ type: Boolean, default: false })
  emailVerified!: boolean;

  @Prop({ type: String, default: null })
  googleId!: string | null;

  @Prop({ type: String, default: null })
  otpCode!: string | null;

  @Prop({ type: Date, default: null })
  otpExpiry!: Date | null;

  @Prop({
    type: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sound: { type: Boolean, default: true },
      },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      dndSchedule: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' },
      },
    },
    default: {},
  })
  preferences!: {
    notifications: {
      email: boolean;
      push: boolean;
      sound: boolean;
    };
    theme: 'light' | 'dark' | 'system';
    dndSchedule: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
