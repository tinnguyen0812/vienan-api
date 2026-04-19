import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ChannelsModule } from './channels/channels.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ── Database ─────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,   // picks up all forFeature() entities
        synchronize: process.env.NODE_ENV !== 'production', // auto-migrate in dev
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),

    // ── Feature modules ──────────────────────────────────────────
    AuthModule,
    UsersModule,
    CategoriesModule,
    ChannelsModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
