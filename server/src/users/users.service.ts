import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    // ── @InjectModel() ───────────────────────────────────────────────────────
    // NestJS ko bolta hai: "mujhe User Mongoose Model chahiye"
    // Model<UserDocument> = MongoDB operations ke liye (find, create, save, etc.)
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ── Email se user dhundhna ───────────────────────────────────────────────
  // Login aur register dono mein use hoga — check karne ke liye user exist karta hai ya nahi
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  // ── Google ID se user dhundhna ───────────────────────────────────────────
  // Google OAuth mein use hoga
  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  // ── ID se user dhundhna ──────────────────────────────────────────────────
  // JWT token mein user ID hoti hai — us se user fetch karne ke liye
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // ── Naya user banana ─────────────────────────────────────────────────────
  // Register ke waqt use hoga
  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save(); // MongoDB mein save karo
  }

  // ── User update karna ────────────────────────────────────────────────────
  // OTP save karna, email verify karna, profile update — sab ke liye
  async updateById(id: string, updateData: Partial<User>): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        updateData,
        { new: true }, // new: true → updated document return karo (purana nahi)
      )
      .exec();
  }
}
