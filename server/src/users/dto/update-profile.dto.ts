import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  displayName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customStatus?: string;

  @IsOptional()
  @IsIn(['online', 'offline', 'away', 'dnd'])
  status?: string;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;
}

