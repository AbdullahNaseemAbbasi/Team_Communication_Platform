import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}
