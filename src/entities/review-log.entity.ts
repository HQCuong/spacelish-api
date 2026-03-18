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
import { Word } from './word.entity';

@Entity()
@Index(['userId', 'reviewedAt'])
export class ReviewLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  wordId: string;

  @Column()
  quality: number; // 0-5

  @CreateDateColumn()
  reviewedAt: Date;

  @ManyToOne(() => User, (user) => user.reviewLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Word, (word) => word.reviewLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wordId' })
  word: Word;
}
