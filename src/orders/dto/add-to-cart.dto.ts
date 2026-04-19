import { IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsString()
  selectedSize?: string;

  @IsOptional()
  @IsString()
  selectedColor?: string;
}
