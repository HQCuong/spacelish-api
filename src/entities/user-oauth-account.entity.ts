import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_oauth_accounts')
export class UserOauthAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'varchar' })
  provider: string;

  @Column({ type: 'varchar' })
  providerUserId: string;

  @Column({ type: 'varchar', nullable: true })
  providerEmail: string;

  @Column({ type: 'varchar', nullable: true })
  providerName: string;

  @Column({ type: 'varchar', nullable: true })
  providerAvatarUrl: string;

  @Column({ type: 'text', nullable: true })
  providerAccessToken: string;

  @Column({ type: 'text', nullable: true })
  providerRefreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  providerTokenExpiresAt: Date;

  @Column({ type: 'text', nullable: true })
  rawProfileJson: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  linkedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.oauthAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
