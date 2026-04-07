import { IsString, IsOptional, MaxLength, MinLength, IsIn } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;

  @IsString()
  workspaceId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsIn(['public', 'private'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}
