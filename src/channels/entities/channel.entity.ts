import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Human-readable name, e.g. "Viên An" */
  @Column({ unique: true })
  name: string;

  /** URL-safe identifier, e.g. "vienan" */
  @Column({ unique: true })
  slug: string;

  /** Optional storefront domain, e.g. "vienan.com" */
  @Column({ nullable: true })
  domain: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
