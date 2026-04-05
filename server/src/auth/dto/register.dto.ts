import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

// ── RegisterDto ───────────────────────────────────────────────────────────────
// Yeh define karta hai POST /api/auth/register ke request body mein kya hona chahiye
// class-validator decorators automatically validate karte hain — invalid data pe 400 error

export class RegisterDto {
  @IsEmail({}, { message: 'Valid email address provide karo' })
  email: string;
  // @IsEmail() → "abc@gmail.com" valid, "abc123" invalid

  @IsString()
  @MinLength(6, { message: 'Password kam az kam 6 characters ka hona chahiye' })
  @MaxLength(50, { message: 'Password 50 characters se zyada nahi hona chahiye' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Display name kam az kam 2 characters ka hona chahiye' })
  @MaxLength(30, { message: 'Display name 30 characters se zyada nahi hona chahiye' })
  displayName: string;
}
