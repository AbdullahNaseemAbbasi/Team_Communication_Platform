import { IsString, IsOptional, MaxLength, IsBoolean, IsNumber } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsBoolean()
  allowGuests?: boolean;

  @IsOptional()
  @IsNumber()
  fileUploadLimit?: number;
}
