import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';

@Module({
  imports: [
    // ── MongooseModule.forFeature() ────────────────────────────────────────────
    // AppModule mein forRoot() se MongoDB se connect kiya tha (ek baar global)
    // forFeature() se specific schema is module mein register karte hain
    // Ab is module ke andar User model inject ho sakta hai
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  // exports kyun? → AuthModule ko UsersService chahiye hogi
  // exports se doosre modules is service ko use kar sakte hain
})
export class UsersModule {}
