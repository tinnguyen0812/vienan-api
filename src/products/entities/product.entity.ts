import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Channel } from '../../channels/entities/channel.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Core fields ─────────────────────────────────────────────────────────

  @Column()
  name: string;

  /** Giá bán (VND). Ví dụ: 215000 */
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  /** Giá gốc trước khi giảm (để hiện strikethrough). Null = không có khuyến mãi */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  /** Array of image URLs; index 0 = primary, index 1 = hover, rest = gallery. */
  @Column({ type: 'simple-array', default: '' })
  images: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  /** Thông tin chất liệu. Ví dụ: "100% Cotton 280gsm" */
  @Column({ nullable: true })
  materialInfo: string;

  /** Định lượng vải (gsm). Ví dụ: 280, 450 */
  @Column({ nullable: true })
  fabricWeight: number;

  /** URL ảnh bảng size */
  @Column({ nullable: true })
  sizeGuideUrl: string;

  /** Link sản phẩm trên Shopee */
  @Column({ nullable: true })
  shopeeLink: string;

  // ── Variants ─────────────────────────────────────────────────────────────

  /**
   * Danh sách size có sẵn. Ví dụ: ["S","M","L","XL","2XL","3XL"]
   * Dùng simple-array (CSV trong 1 column).
   */
  @Column({ type: 'simple-array', nullable: true })
  sizes: string[];

  /**
   * Danh sách màu sắc có sẵn. Ví dụ: ["Đen","Trắng","Xanh Navy","Xám"]
   * Format: tên màu tiếng Việt.
   */
  @Column({ type: 'simple-array', nullable: true })
  colors: string[];

  // ── Discovery & SEO ───────────────────────────────────────────────────────

  /**
   * Tags để filter/search. Ví dụ: ["unisex","oversize","boxy","tay-dai"]
   */
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  /** Slug URL-friendly. Ví dụ: "ao-thun-boxy-new-york" */
  @Column({ unique: true, nullable: true })
  slug: string;

  // ── Inventory ─────────────────────────────────────────────────────────────

  @Column({ default: 0 })
  stock: number;

  /** Số lượng đã bán (hiện thị trên storefront để tạo social proof) */
  @Column({ default: 0 })
  soldCount: number;

  // ── Internal metadata ────────────────────────────────────────────────────

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations ────────────────────────────────────────────────────────────

  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category: Category;

  /** Channel này product thuộc về */
  @Column('uuid')
  channelId: string;

  @ManyToOne(() => Channel, { eager: false, onDelete: 'RESTRICT' })
  channel: Channel;

  @OneToMany(() => ProductVariant, (v) => v.product, {
    cascade: false,
    eager: false,
  })
  variants: ProductVariant[];
}
