import 'dotenv/config';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';

const OLD_CATEGORY_SLUGS = ['unisex-boxy', 'oversized', 'regular-fit', 'crop-top', 'polo', 'hoodie'];
const TEST_PRODUCT_NAMES = ['Classic Logo Tee'];

const CATEGORY_UPDATES = [
  { slug: 'ao-tay-ngan', name: 'Áo Tay Ngắn', sortOrder: 1, description: 'Áo thun tay ngắn unisex và basic cho mặc hằng ngày' },
  { slug: 'ao-tay-dai', name: 'Áo Tay Dài', sortOrder: 2, description: 'Áo tay dài phong cách streetwear và local brand' },
  { slug: 'ao-hoodie', name: 'Áo Hoodie', sortOrder: 3, description: 'Hoodie nỉ form rộng mặc mùa lạnh' },
  { slug: 'ao-polo', name: 'Áo Polo', sortOrder: 4, description: 'Áo polo nam nữ lịch sự nhưng vẫn trẻ trung' },
  { slug: 'quan', name: 'Quần', sortOrder: 5, description: 'Quần thun và quần nỉ phối đồ dễ dàng' },
  { slug: 'phu-kien', name: 'Phụ kiện', sortOrder: 6, description: 'Phụ kiện local brand đồng bộ theo outfit' },
];

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
});

async function main() {
  await dataSource.initialize();
  console.log('Connected to DB');

  // 1. Remove test product(s) to avoid FK conflicts with old categories.
  for (const productName of TEST_PRODUCT_NAMES) {
    await dataSource.query(`DELETE FROM order_items WHERE "productId" IN (SELECT id FROM products WHERE name = $1)`, [productName]);
    await dataSource.query(`DELETE FROM product_variants WHERE "productId" IN (SELECT id FROM products WHERE name = $1)`, [productName]);
    await dataSource.query(`DELETE FROM products WHERE name = $1`, [productName]);
  }

  // 2. Delete legacy categories if still present.
  for (const slug of OLD_CATEGORY_SLUGS) {
    await dataSource.query(`DELETE FROM categories WHERE slug = $1`, [slug]);
  }

  // 3. Upsert the 6 canonical categories with Vietnamese names.
  for (const cat of CATEGORY_UPDATES) {
    const existing = await dataSource.query(`SELECT id FROM categories WHERE slug = $1 LIMIT 1`, [cat.slug]);
    if (existing.length > 0) {
      await dataSource.query(
        `UPDATE categories SET name = $1, description = $2, "sortOrder" = $3, "isActive" = true WHERE slug = $4`,
        [cat.name, cat.description, cat.sortOrder, cat.slug],
      );
    } else {
      await dataSource.query(
        `INSERT INTO categories (id, name, slug, description, "sortOrder", "isActive") VALUES ($1, $2, $3, $4, $5, true)`,
        [randomUUID(), cat.name, cat.slug, cat.description, cat.sortOrder],
      );
    }
  }

  const summary = await dataSource.query(`
    SELECT c.name, COUNT(p.id)::int AS product_count
    FROM categories c
    LEFT JOIN products p ON p."categoryId" = c.id
    GROUP BY c.id, c.name
    ORDER BY c."sortOrder", c.name;
  `);

  console.table(summary);
  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});