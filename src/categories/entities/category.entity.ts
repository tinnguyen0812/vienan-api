import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Tên hiển thị. Ví dụ: "Áo Tay Ngắn" */
  @Column({ unique: true })
  name: string;

  /** URL slug. Ví dụ: "ao-tay-ngan" */
  @Column({ unique: true })
  slug: string;

  /** Mô tả ngắn cho category */
  @Column({ nullable: true })
  description: string;

  /** Ảnh đại diện category (hiển thị trên storefront) */
  @Column({ nullable: true })
  imageUrl: string;

  /** Thứ tự hiển thị (nhỏ hơn = hiện trước) */
  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
