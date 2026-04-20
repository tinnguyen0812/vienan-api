/**
 * Database seeder — run with: npm run seed
 * Creates: Viên An channel, admin users, API key, categories, and sample product
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Channel } from '../channels/entities/channel.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { ApiKey } from '../auth/entities/api-key.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Role } from '../common/enums/role.enum';

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
  entities: [Channel, User, Category, Product, ProductVariant, ApiKey, Order, OrderItem],
  synchronize: true,
});

async function main() {
  await ds.initialize();
  console.log('🌱 Seeding...');

  // Cleanup legacy rows that still have numeric-style IDs before UUID-only seeding.
  await ds.query(`
    DELETE FROM "order_items"
    WHERE "id"::text ~ '^[0-9]+$'
       OR "orderId"::text ~ '^[0-9]+$'
       OR "productId"::text ~ '^[0-9]+$';
  `);
  await ds.query(`
    DELETE FROM "orders"
    WHERE "id"::text ~ '^[0-9]+$'
       OR "userId"::text ~ '^[0-9]+$'
       OR "channelId"::text ~ '^[0-9]+$';
  `);
  await ds.query(`DELETE FROM "products" WHERE "id"::text ~ '^[0-9]+$' OR "categoryId"::text ~ '^[0-9]+$' OR "channelId"::text ~ '^[0-9]+$';`);
  await ds.query(`DELETE FROM "api_keys" WHERE "id"::text ~ '^[0-9]+$' OR "channelId"::text ~ '^[0-9]+$';`);
  await ds.query(`DELETE FROM "users" WHERE "id"::text ~ '^[0-9]+$' OR "channelId"::text ~ '^[0-9]+$';`);
  await ds.query(`DELETE FROM "categories" WHERE "id"::text ~ '^[0-9]+$';`);
  await ds.query(`DELETE FROM "channels" WHERE "id"::text ~ '^[0-9]+$';`);

  const channelRepo = ds.getRepository(Channel);
  const channel =
    (await channelRepo.findOne({ where: { slug: 'vienan' } })) ??
    (await channelRepo.save(
      channelRepo.create({
        name: 'Viên An',
        slug: 'vienan',
        domain: 'vienan.com',
      }),
    ));
  console.log(`✅ Channel: ${channel.name}`);

  // Categories
  const catRepo = ds.getRepository(Category);
  const categories = [
    { name: 'Unisex Boxy', slug: 'unisex-boxy' },
    { name: 'Oversized', slug: 'oversized' },
    { name: 'Regular Fit', slug: 'regular-fit' },
    { name: 'Crop Top', slug: 'crop-top' },
    { name: 'Polo', slug: 'polo' },
    { name: 'Hoodie', slug: 'hoodie' },
  ];

  for (const item of categories) {
    const exists = await catRepo.findOne({ where: { slug: item.slug } });
    if (!exists) {
      await catRepo.save(catRepo.create(item));
    }
  }

  const cats = await catRepo.find();
  console.log(`✅ ${cats.length} categories`);

  // Admin user
  const userRepo = ds.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: 'admin@vienan.com' } });
  let admin = existing;
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        name: 'Super Admin',
        email: 'admin@vienan.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: Role.SUPER_ADMIN,
      }),
    );
  }
  console.log(`✅ Admin: ${admin.email}`);

  // Channel admin
  let channelAdmin = await userRepo.findOne({ where: { email: 'admin@channel-vienan.com' } });
  if (!channelAdmin) {
    channelAdmin = await userRepo.save(
      userRepo.create({
        name: 'Viên An Admin',
        email: 'admin@channel-vienan.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: Role.ADMIN,
        channelId: channel.id,
      }),
    );
  }
  console.log(`✅ Channel Admin: ${channelAdmin.email}`);

  // API Key for Viên An channel
  const keyRepo = ds.getRepository(ApiKey);
  const existingKey = await keyRepo.findOne({ where: { channelId: channel.id } });
  let apiKeyValue = existingKey?.key;
  if (!existingKey) {
    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = await keyRepo.save(
      keyRepo.create({ key, label: 'Viên An Web - Production', channelId: channel.id }),
    );
    apiKeyValue = apiKey.key;
  }
  console.log(`✅ API key: ${apiKeyValue}`);

  // Products
  const prodRepo = ds.getRepository(Product);
  const productExists = await prodRepo.findOne({ where: { name: 'Classic Logo Tee' } });
  if (!productExists) {
    await prodRepo.save(
      prodRepo.create({
        name: 'Classic Logo Tee',
        description: 'Comfortable everyday cotton T-shirt.',
        price: 29.99,
        stock: 100,
        images: [],
        categoryId: cats[0].id,
        channelId: channel.id,
      }),
    );
  }
  console.log('✅ Sample product ready');

  console.log('\n🎉 Done!  Super Admin: admin@vienan.com / Admin@123');
  console.log('🎉 Channel Admin: admin@channel-vienan.com / Admin@123');
  console.log(`🎉 API Key: ${apiKeyValue}`);
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
