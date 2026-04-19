import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { User } from '../../users/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';
import { OrderItem } from './order-item.entity';

/** CustomerInfo is stored as a JSON snapshot. */
interface CustomerInfo {
  phone: string;
  name: string;
  province: string;
  provinceCode: string;
  district?: string;
  districtCode?: string;
  ward?: string;
  wardCode?: string;
  addressDetail: string;
  fullAddress: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Status & payment ────────────────────────────────────────────────────

  @Column({ type: 'varchar', default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'varchar' })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  shopeeOrderId: string;

  // ── Financials ──────────────────────────────────────────────────────────

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  shippingFee: number;

  /** subtotal + shippingFee */
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  // ── Customer snapshot ───────────────────────────────────────────────────

  @Column({ type: 'simple-json' })
  customerInfo: CustomerInfo;

  // ── Timestamps ──────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations ───────────────────────────────────────────────────────────

  /** Guest checkout: userId = null */
  @Column('uuid', { nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User;

  /** Channel mà đơn hàng này đến từ */
  @Column('uuid')
  channelId: string;

  @ManyToOne(() => Channel, { eager: false, onDelete: 'RESTRICT' })
  channel: Channel;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];
}

