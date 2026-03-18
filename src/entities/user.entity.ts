import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AuthProvider } from '../common/enums/auth-provider.enum';
import { UserOauthAccount } from './user-oauth-account.entity';
import { UserToken } from './user-token.entity';
import { Deck } from './deck.entity';
import { Review } from './review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ type: 'varchar', nullable: true })
  timezone: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserOauthAccount, (oauth) => oauth.user)
  oauthAccounts: UserOauthAccount[];

  @OneToMany(() => UserToken, (token) => token.user)
  tokens: UserToken[];

  @OneToMany(() => Deck, (deck) => deck.user)
  decks: Deck[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
