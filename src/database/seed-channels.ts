import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { User } from '../users/entities/user.entity';
import { ApiKey } from '../auth/entities/api-key.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Role } from '../common/enums/role.enum';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Channel, User, ApiKey, Category, Product, Order, OrderItem],
  synchronize: true,
});

async function main() {
  await dataSource.initialize();

  // Cleanup legacy rows that still have numeric-style IDs before UUID-only seeding.
  await dataSource.query(`
    DELETE FROM "order_items"
    WHERE "id"::text ~ '^[0-9]+$'
       OR "orderId"::text ~ '^[0-9]+$'
       OR "productId"::text ~ '^[0-9]+$';
  `);
  await dataSource.query(`
    DELETE FROM "orders"
    WHERE "id"::text ~ '^[0-9]+$'
       OR "userId"::text ~ '^[0-9]+$'
       OR "channelId"::text ~ '^[0-9]+$';
  `);
  await dataSource.query(`DELETE FROM "products" WHERE "id"::text ~ '^[0-9]+$' OR "categoryId"::text ~ '^[0-9]+$' OR "channelId"::text ~ '^[0-9]+$';`);
  await dataSource.query(`DELETE FROM "api_keys" WHERE "id"::text ~ '^[0-9]+$' OR "channelId"::text ~ '^[0-9]+$';`);
  await dataSource.query(`DELETE FROM "users" WHERE "id"::text ~ '^[0-9]+$' OR "channelId"::text ~ '^[0-9]+$';`);
  await dataSource.query(`DELETE FROM "categories" WHERE "id"::text ~ '^[0-9]+$';`);
  await dataSource.query(`DELETE FROM "channels" WHERE "id"::text ~ '^[0-9]+$';`);

  const channelRepo = dataSource.getRepository(Channel);
  const userRepo = dataSource.getRepository(User);
  const apiKeyRepo = dataSource.getRepository(ApiKey);

  const channel =
    (await channelRepo.findOne({ where: { slug: 'vienan' } })) ??
    (await channelRepo.save(
      channelRepo.create({
        name: 'Viên An',
        slug: 'vienan',
        domain: 'vienan.com',
      }),
    ));

  const admin =
    (await userRepo.findOne({ where: { email: 'admin@vienan.com' } })) ??
    (await userRepo.save(
      userRepo.create({
        name: 'Super Admin',
        email: 'admin@vienan.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: Role.SUPER_ADMIN,
      }),
    ));

  const channelAdmin =
    (await userRepo.findOne({ where: { email: 'admin@channel-vienan.com' } })) ??
    (await userRepo.save(
      userRepo.create({
        name: 'Viên An Admin',
        email: 'admin@channel-vienan.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: Role.ADMIN,
        channelId: channel.id,
      }),
    ));

  let apiKey = await apiKeyRepo.findOne({ where: { channelId: channel.id } });
  if (!apiKey) {
    apiKey = await apiKeyRepo.save(
      apiKeyRepo.create({
        key: crypto.randomBytes(32).toString('hex'),
        label: 'Viên An Web Production',
        channelId: channel.id,
      }),
    );
  }

  console.log(`Channel: ${channel.name} (#${channel.id})`);
  console.log(`Admin: ${admin.email}`);
  console.log(`Channel Admin: ${channelAdmin.email}`);
  console.log(`API key: ${apiKey.key}`);

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});