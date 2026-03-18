import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TokenType } from '../common/enums/token-type.enum';

@Entity()
@Index(['userId', 'type'])
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
