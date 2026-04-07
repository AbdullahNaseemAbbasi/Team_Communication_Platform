import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  channelId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  parentMessageId?: string;

  @IsOptional()
  @IsArray()
  attachments?: {
    url: string;
    filename: string;
    fileType: string;
    size: number;
  }[];

  @IsOptional()
  @IsArray()
  mentions?: string[];
}
