import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ApiKey } from '../auth/entities/api-key.entity';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { ApiKeyOrJwtGuard } from '../common/guards/api-key-or-jwt.guard';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ApiKey]),
    AuthModule,   // cung cấp JwtModule (JwtService) cho ApiKeyOrJwtGuard
  ],
  controllers: [ProductsController, ProductVariantsController],
  providers: [ProductsService, ProductVariantsService, ApiKeyGuard, ApiKeyOrJwtGuard],
  exports: [ProductsService, ProductVariantsService],
})
export class ProductsModule {}
