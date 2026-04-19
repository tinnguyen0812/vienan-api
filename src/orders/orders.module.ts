import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { ApiKey } from '../auth/entities/api-key.entity';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { Channel } from '../channels/entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, ProductVariant, ApiKey, Channel])],
  controllers: [OrdersController],
  providers: [OrdersService, ApiKeyGuard],
})
export class OrdersModule {}
