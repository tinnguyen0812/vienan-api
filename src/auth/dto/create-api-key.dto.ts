import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApiKeyDto {
  @IsOptional()
  @IsString()
  label?: string;

  /** ID của channel mà API key này thuộc về */
  @IsUUID()
  channelId: string;
}
