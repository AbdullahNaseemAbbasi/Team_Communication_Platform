import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// ── User Document Type ────────────────────────────────────────────────────────
// HydratedDocument<User> = MongoDB document + Mongoose methods (.save(), .toJSON(), etc.)
// Yeh type hum service mein use karenge jab MongoDB se user fetch karein
export type UserDocument = HydratedDocument<User>;

// ── @Schema() Decorator ───────────────────────────────────────────────────────
// NestJS ko batata hai: "yeh class ek MongoDB schema hai"
// timestamps: true → MongoDB automatically createdAt aur updatedAt fields add karta hai
@Schema({ timestamps: true })
export class User {
  // ── @Prop() Decorator ───────────────────────────────────────────────────────
  // Har field ke liye @Prop() use hota hai
  // Andar options dete hain: required, unique, default, etc.

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;
  // required: true → email ke baghair user save nahi hoga
  // unique: true → ek email se sirf ek account
  // lowercase: true → MongoDB automatically lowercase mein store karega
  // trim: true → spaces remove karega start/end se

  @Prop({ type: String, default: null })
  password: string | null;
  // null kyun? → Google OAuth users ke paas password nahi hota
  // Email/password users ka password yahan bcrypt hash hoga
  // type: String explicitly batana zaroori hai jab union type ho (string | null)

  @Prop({ type: String, required: true, trim: true })
  displayName: string;
  // Chat mein naam yahi dikhega

  @Prop({ type: String, default: null })
  avatar: string | null;
  // Cloudinary image URL — profile picture

  @Prop({ type: String, enum: ['online', 'offline', 'away', 'dnd'], default: 'offline' })
  status: string;
  // enum → sirf yeh 4 values allowed hain
  // dnd = Do Not Disturb

  @Prop({ type: String, default: null })
  customStatus: string | null;
  // "In a meeting", "Busy", etc. — user khud set karta hai

  @Prop({ type: Date, default: null })
  lastSeen: Date | null;
  // Jab offline ho, "Last seen 2 hours ago" dikhaega

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;
  // false → user ne OTP verify nahi kiya abhi tak
  // true → email verified hai, login kar sakta hai

  @Prop({ type: String, default: null })
  googleId: string | null;
  // Google OAuth se aaya toh yahan Google ka unique ID store hoga
  // Email/password users ke liye null

  @Prop({ type: String, default: null })
  otpCode: string | null;
  // Email verification ke liye 6-digit OTP yahan temporarily store hoga

  @Prop({ type: Date, default: null })
  otpExpiry: Date | null;
  // OTP 10 minute ke baad expire ho jaaye — security ke liye

  // ── Nested Object: User Preferences ────────────────────────────────────────
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
  preferences: {
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

// ── SchemaFactory ─────────────────────────────────────────────────────────────
// User class se actual Mongoose Schema banata hai
// Yeh schema MongooseModule.forFeature() mein register hoga
export const UserSchema = SchemaFactory.createForClass(User);
