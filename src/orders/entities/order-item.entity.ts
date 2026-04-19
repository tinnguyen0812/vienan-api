import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  /** Unit price at the time of purchase */
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  /** Snapshot of product name at purchase time */
  @Column()
  productName: string;

  /** Snapshot of the first product image at purchase time */
  @Column()
  productImage: string;

  @Column({ nullable: true })
  selectedSize: string;

  @Column({ nullable: true })
  selectedColor: string;

  @Column('uuid', { nullable: true })
  variantId: string;

  @Column({ nullable: true })
  sku: string;

  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, { eager: true, nullable: true })
  product: Product;
}
