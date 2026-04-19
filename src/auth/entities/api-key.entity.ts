import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from '../../channels/entities/channel.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  /** Mô tả, ví dụ: "Viên An Web Production" */
  @Column({ default: '' })
  label: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  /** Channel mà API key này thuộc về */
  @Column('uuid')
  channelId: string;

  @ManyToOne(() => Channel, { eager: true, onDelete: 'CASCADE' })
  channel: Channel;
}
