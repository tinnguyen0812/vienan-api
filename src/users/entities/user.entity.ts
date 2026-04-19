import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { ApiKey } from '../../auth/entities/api-key.entity';
import { Channel } from '../../channels/entities/channel.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', default: Role.ADMIN })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Relations ────────────────────────────────────────────────────────────

  /** null = Super Admin (thấy tất cả channels) */
  @Column('uuid', { nullable: true })
  channelId: string;

  @ManyToOne(() => Channel, { nullable: true, eager: false, onDelete: 'SET NULL' })
  channel: Channel;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  /** API keys không còn gắn với user — đã chuyển sang Channel */
  @OneToMany(() => ApiKey, (key) => key.channel)
  apiKeys: ApiKey[];
}

