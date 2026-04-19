import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class CustomerInfoDto {
  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsString()
  province: string;

  @IsString()
  provinceCode: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  wardCode?: string;

  @IsString()
  addressDetail: string;

  @IsString()
  fullAddress: string;
}

export class CartItemPayloadDto {
  @IsUUID()
  variantId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemPayloadDto)
  items: CartItemPayloadDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  shopeeOrderId?: string;
}
