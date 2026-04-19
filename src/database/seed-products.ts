import 'dotenv/config';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { User } from '../users/entities/user.entity';
import { ApiKey } from '../auth/entities/api-key.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

type SeedProduct = {
  name: string;
  productCode: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description?: string;
  materialInfo?: string;
  fabricWeight?: number;
  shopeeLink?: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  stockPerVariant?: number;
  soldCount?: number;
  categorySlug: string;
};

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  entities: [
    Channel,
    Category,
    Product,
    ProductVariant,
    User,
    ApiKey,
    Order,
    OrderItem,
  ],
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const COLOR_MAP: Record<string, string> = {
  Den: '#1a1a1a',
  Trang: '#f8f8f8',
  Xam: '#9e9e9e',
  XamDam: '#616161',
  XanhNavy: '#1b2a4a',
  XanhReu: '#4a5e3a',
  Kem: '#f5f0e8',
  Be: '#e8dcc8',
  Nau: '#795548',
  DoDo: '#8b0000',
  XanhBo: '#b5c4b1',
  HongPastel: '#f8bbd0',
  CamDat: '#d2691e',
  Tim: '#7b1fa2',
  Olive: '#808000',
};

const CATEGORIES = [
  {
    name: 'Ao Tay Ngan',
    slug: 'ao-tay-ngan',
    description: 'Ao thun tay ngan unisex va basic cho mac hang ngay',
    sortOrder: 1,
  },
  {
    name: 'Ao Tay Dai',
    slug: 'ao-tay-dai',
    description: 'Ao tay dai phong cach streetwear va local brand',
    sortOrder: 2,
  },
  {
    name: 'Ao Hoodie',
    slug: 'ao-hoodie',
    description: 'Hoodie ni form rong mac mua lanh',
    sortOrder: 3,
  },
  {
    name: 'Ao Polo',
    slug: 'ao-polo',
    description: 'Ao polo nam nu lich su nhung van tre trung',
    sortOrder: 4,
  },
  {
    name: 'Quan',
    slug: 'quan',
    description: 'Quan thun va quan ni phoi do de dang',
    sortOrder: 5,
  },
  {
    name: 'Phu kien',
    slug: 'phu-kien',
    description: 'Phu kien local brand dong bo theo outfit',
    sortOrder: 6,
  },
];

// Shopee blocks data extraction for anonymous automation. This dataset is a manually curated
// starter catalog following Vien An naming and pricing style for development seeding.
const PRODUCTS: SeedProduct[] = [
  {
    name: 'Ao Thun Boxy Co Tron Tay Ngan Unisex 280gsm',
    productCode: 'BOXY280',
    price: 185000,
    originalPrice: 220000,
    images: [
      'https://down-vn.img.susercontent.com/file/7e5c87cd0f3267c9f4df5ce5dd739f7f',
      'https://down-vn.img.susercontent.com/file/45da6ff9c2e0e9b5f61e4d585c30dcb4',
    ],
    description: 'Ao thun form boxy unisex, vai day va dung form, phu hop mac hang ngay.',
    materialInfo: '100% Cotton',
    fabricWeight: 280,
    shopeeLink: 'https://shopee.vn/thoitrang_vienan',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['Den', 'Trang', 'Xam', 'XanhNavy', 'Kem'],
    tags: ['unisex', 'boxy', 'basic', 'tay-ngan', 'co-tron'],
    stockPerVariant: 20,
    soldCount: 120,
    categorySlug: 'ao-tay-ngan',
  },
  {
    name: 'Ao Thun Oversize In Chu Minimal 280gsm',
    productCode: 'OVRMINI',
    price: 199000,
    originalPrice: 249000,
    images: [
      'https://down-vn.img.susercontent.com/file/8b5c8b75a4fdcb17fcb7f0f05f9f944b',
    ],
    description: 'Oversize minimal, in chu nhe, de phoi voi jean va short.',
    materialInfo: 'Cotton Compact',
    fabricWeight: 280,
    shopeeLink: 'https://shopee.vn/thoitrang_vienan',
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: ['Den', 'Trang', 'Be'],
    tags: ['oversize', 'minimal', 'tay-ngan', 'streetwear'],
    stockPerVariant: 18,
    soldCount: 80,
    categorySlug: 'ao-tay-ngan',
  },
  {
    name: 'Ao Tay Dai Local Brand Form Rong 250gsm',
    productCode: 'LSD250',
    price: 215000,
    images: [
      'https://down-vn.img.susercontent.com/file/4d0f8cc9afbbf3f4f0ee8d4de0e6b1ac',
    ],
    description: 'Ao tay dai local brand form rong, hop mua mua va phong lanh.',
    materialInfo: 'Cotton Poly',
    fabricWeight: 250,
    shopeeLink: 'https://shopee.vn/thoitrang_vienan',
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: ['Den', 'Trang', 'XamDam', 'XanhReu'],
    tags: ['tay-dai', 'local-brand', 'form-rong'],
    stockPerVariant: 16,
    soldCount: 52,
    categorySlug: 'ao-tay-dai',
  },
  {
    name: 'Ao Tay Dai Waffle Basic Unisex',
    productCode: 'WAFFLE',
    price: 229000,
    images: [
      'https://down-vn.img.susercontent.com/file/e9b5cf9efcb58d7f6fe7a0d52bcf9d58',
    ],
    description: 'Chat lieu waffle mem, thoang va co do co gian tot.',
    materialInfo: 'Waffle Cotton Blend',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Kem', 'Nau', 'Den'],
    tags: ['waffle', 'tay-dai', 'basic'],
    stockPerVariant: 15,
    soldCount: 30,
    categorySlug: 'ao-tay-dai',
  },
  {
    name: 'Hoodie Ni Bong Form Rong 450gsm',
    productCode: 'HOO450',
    price: 349000,
    originalPrice: 420000,
    images: [
      'https://down-vn.img.susercontent.com/file/8f6ec3e4cb474a46a1773d6a9ef8ff8c',
    ],
    description: 'Hoodie ni bong day, giu am tot, style unisex.',
    materialInfo: 'Nylon Cotton Fleece',
    fabricWeight: 450,
    sizes: ['M', 'L', 'XL', '2XL', '3XL'],
    colors: ['Den', 'XamDam', 'Nau'],
    tags: ['hoodie', 'ni-bong', 'winter', 'unisex'],
    stockPerVariant: 14,
    soldCount: 65,
    categorySlug: 'ao-hoodie',
  },
  {
    name: 'Hoodie Zip Oversize Theu Logo',
    productCode: 'HZIP01',
    price: 369000,
    images: [
      'https://down-vn.img.susercontent.com/file/2dbdc78e4e188fa7bbd0f1feeb6afec3',
    ],
    description: 'Hoodie zip oversize, theu logo truoc nguc, de layer.',
    materialInfo: 'Cotton Fleece',
    sizes: ['M', 'L', 'XL'],
    colors: ['Den', 'Xam', 'Olive'],
    tags: ['hoodie', 'zip', 'oversize'],
    stockPerVariant: 12,
    soldCount: 25,
    categorySlug: 'ao-hoodie',
  },
  {
    name: 'Ao Polo Theu Vienan Premium',
    productCode: 'POLOPRM',
    price: 259000,
    images: [
      'https://down-vn.img.susercontent.com/file/7d9c6f0cda4a7d95b6603526f4c52f05',
    ],
    description: 'Ao polo vai ca sau mem, phong cach lich su hien dai.',
    materialInfo: 'Pique Cotton',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Den', 'Trang', 'XanhNavy', 'Be'],
    tags: ['polo', 'premium', 'theu-logo'],
    stockPerVariant: 18,
    soldCount: 42,
    categorySlug: 'ao-polo',
  },
  {
    name: 'Ao Polo Oversize Co V Classic',
    productCode: 'POLOOVR',
    price: 245000,
    images: [
      'https://down-vn.img.susercontent.com/file/9f7da6172e4a78f25a9af72bc0ce39d8',
    ],
    description: 'Polo oversize co V, de phoi quan short va kaki.',
    materialInfo: 'Cotton Blend',
    sizes: ['M', 'L', 'XL'],
    colors: ['Trang', 'Xam', 'XanhReu'],
    tags: ['polo', 'oversize', 'classic'],
    stockPerVariant: 12,
    soldCount: 20,
    categorySlug: 'ao-polo',
  },
  {
    name: 'Quan Short Ni Basic Unisex',
    productCode: 'SHORT01',
    price: 179000,
    images: [
      'https://down-vn.img.susercontent.com/file/514bcc1f7a762de7ee28f903f2d569f3',
    ],
    description: 'Quan short ni basic, lung chun thoai mai, de hoat dong.',
    materialInfo: 'Cotton Terry',
    sizes: ['M', 'L', 'XL'],
    colors: ['Den', 'Xam', 'Kem'],
    tags: ['quan-short', 'basic', 'unisex'],
    stockPerVariant: 20,
    soldCount: 55,
    categorySlug: 'quan',
  },
  {
    name: 'Quan Jogger Form Rong Street',
    productCode: 'JOGGER',
    price: 289000,
    images: [
      'https://down-vn.img.susercontent.com/file/e1f7b3c37d3496f31f617ec4c2286f52',
    ],
    description: 'Jogger form rong, ong bo, phu hop phong cach streetwear.',
    materialInfo: 'Cotton Poly',
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: ['Den', 'XamDam', 'Olive'],
    tags: ['jogger', 'streetwear', 'quan'],
    stockPerVariant: 16,
    soldCount: 38,
    categorySlug: 'quan',
  },
  {
    name: 'Mu Luoi Trai Theu Chu Vienan',
    productCode: 'CAP001',
    price: 149000,
    images: [
      'https://down-vn.img.susercontent.com/file/9bcc1d7f0cb9142cb5d2fa5d76a9c78c',
    ],
    description: 'Mu luoi trai de phoi outfit, vai day va dung form.',
    materialInfo: 'Canvas Cotton',
    sizes: ['FREESIZE'],
    colors: ['Den', 'Kem', 'XanhNavy'],
    tags: ['phu-kien', 'mu', 'local-brand'],
    stockPerVariant: 25,
    soldCount: 70,
    categorySlug: 'phu-kien',
  },
  {
    name: 'Tat Co Cao Local Brand 3 Doi',
    productCode: 'SOCK03',
    price: 99000,
    images: [
      'https://down-vn.img.susercontent.com/file/8050fba3e7dd68b6077ac3a50ca15ab6',
    ],
    description: 'Set tat co cao local brand, thun mem, co gian tot.',
    materialInfo: 'Cotton Spandex',
    sizes: ['FREESIZE'],
    colors: ['Trang', 'Den', 'Xam'],
    tags: ['phu-kien', 'tat', 'set'],
    stockPerVariant: 35,
    soldCount: 95,
    categorySlug: 'phu-kien',
  },
];

function toColorKey(color: string): string {
  return color
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function generateSku(productCode: string, color: string, size: string): string {
  const colorSlug = toColorKey(color).substring(0, 6).toUpperCase();
  return `${productCode}-${colorSlug}-${size.toUpperCase()}`;
}

async function createVariants(
  db: DataSource,
  productId: string,
  productCode: string,
  colors: string[],
  sizes: string[],
  stockPerVariant: number,
) {
  for (const color of colors) {
    for (const size of sizes) {
      const sku = generateSku(productCode, color, size);
      const colorCode = COLOR_MAP[toColorKey(color)] ?? null;

      await db.query(
        `
        INSERT INTO product_variants
          (id, "productId", size, color, "colorCode", sku, stock, price, "isActive")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        ON CONFLICT (sku) DO NOTHING
      `,
        [
          randomUUID(),
          productId,
          size,
          color,
          colorCode,
          sku,
          stockPerVariant,
          null,
        ],
      );
    }
  }

  const result = await db.query(
    `SELECT COALESCE(SUM(stock), 0) AS total FROM product_variants WHERE "productId" = $1`,
    [productId],
  );

  await db.query(`UPDATE products SET stock = $1 WHERE id = $2`, [Number(result[0].total), productId]);
}

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to DB');

  const channels = await AppDataSource.query(
    `SELECT id FROM channels WHERE slug = 'vienan' LIMIT 1`,
  );
  if (channels.length === 0) {
    throw new Error('Channel "vienan" not found. Run seed first!');
  }
  const channelId = channels[0].id as string;

  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const existing = await AppDataSource.query(
      `SELECT id FROM categories WHERE slug = $1 LIMIT 1`,
      [cat.slug],
    );

    let catId: string;
    if (existing.length > 0) {
      catId = existing[0].id;
      await AppDataSource.query(
        `
        UPDATE categories
        SET name = $1, description = $2, "sortOrder" = $3, "isActive" = true
        WHERE id = $4
      `,
        [cat.name, cat.description, cat.sortOrder, catId],
      );
    } else {
      catId = randomUUID();
      await AppDataSource.query(
        `
        INSERT INTO categories (id, name, slug, description, "imageUrl", "sortOrder", "isActive")
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `,
        [catId, cat.name, cat.slug, cat.description, null, cat.sortOrder],
      );
    }

    categoryMap[cat.slug] = catId;
  }

  let created = 0;
  let updated = 0;

  for (const p of PRODUCTS) {
    const productSlug = slugify(p.name);
    const existing = await AppDataSource.query(
      `SELECT id FROM products WHERE slug = $1 LIMIT 1`,
      [productSlug],
    );

    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) {
      console.warn(`Skip product without category: ${p.name}`);
      continue;
    }

    let productId: string;
    if (existing.length > 0) {
      productId = existing[0].id;
      updated++;
      await AppDataSource.query(
        `
        UPDATE products
        SET
          name = $1,
          price = $2,
          "originalPrice" = $3,
          images = $4,
          description = $5,
          "materialInfo" = $6,
          "fabricWeight" = $7,
          "shopeeLink" = $8,
          sizes = $9,
          colors = $10,
          tags = $11,
          slug = $12,
          "soldCount" = $13,
          "isActive" = true,
          "categoryId" = $14,
          "channelId" = $15,
          "updatedAt" = NOW()
        WHERE id = $16
      `,
        [
          p.name,
          p.price,
          p.originalPrice ?? null,
          p.images.join(','),
          p.description ?? null,
          p.materialInfo ?? null,
          p.fabricWeight ?? null,
          p.shopeeLink ?? null,
          p.sizes.join(','),
          p.colors.join(','),
          p.tags.join(','),
          productSlug,
          p.soldCount ?? 0,
          categoryId,
          channelId,
          productId,
        ],
      );
    } else {
      productId = randomUUID();
      created++;
      await AppDataSource.query(
        `
        INSERT INTO products (
          id, name, price, "originalPrice", images, description,
          "materialInfo", "fabricWeight", "sizeGuideUrl", "shopeeLink",
          sizes, colors, tags, slug,
          stock, "soldCount", "isActive",
          "categoryId", "channelId"
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          0, $15, true,
          $16, $17
        )
      `,
        [
          productId,
          p.name,
          p.price,
          p.originalPrice ?? null,
          p.images.join(','),
          p.description ?? null,
          p.materialInfo ?? null,
          p.fabricWeight ?? null,
          null,
          p.shopeeLink ?? null,
          p.sizes.join(','),
          p.colors.join(','),
          p.tags.join(','),
          productSlug,
          p.soldCount ?? 0,
          categoryId,
          channelId,
        ],
      );
    }

    await createVariants(
      AppDataSource,
      productId,
      p.productCode,
      p.colors,
      p.sizes,
      p.stockPerVariant ?? 20,
    );
  }

  const variantCountResult = await AppDataSource.query(`SELECT COUNT(*)::int AS total FROM product_variants`);
  const productCountResult = await AppDataSource.query(`SELECT COUNT(*)::int AS total FROM products`);

  console.log(`Seed products done. Created: ${created}, Updated: ${updated}`);
  console.log(`Total products: ${productCountResult[0].total}`);
  console.log(`Total variants: ${variantCountResult[0].total}`);

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed products failed:', err.message);
  process.exit(1);
});
