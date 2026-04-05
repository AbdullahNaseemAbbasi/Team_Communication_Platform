import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Valid email address provide karo' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
