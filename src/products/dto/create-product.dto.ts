import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  materialInfo?: string;

  @IsOptional()
  @IsString()
  sizeGuideUrl?: string;

  @IsOptional()
  @IsString()
  shopeeLink?: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * Chỉ dùng khi Super Admin tạo product.
   * Channel Admin: channelId tự động lấy từ JWT.
   */
  @IsOptional()
  @IsUUID()
  channelId?: string;
}
