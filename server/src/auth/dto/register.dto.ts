import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(30, { message: 'Display name must not exceed 30 characters' })
  displayName: string;
}
