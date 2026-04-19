import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug phải là chữ thường, số và dấu gạch ngang' })
  @MaxLength(50)
  slug: string;

  @IsOptional()
  @IsString()
  domain?: string;
}
