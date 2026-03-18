import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CollectionWord } from './collection-word.entity';
import { ReviewLog } from './review-log.entity';
import { WordType } from '../common/enums/word-type.enum';

@Entity()
@Unique(['userId', 'term'])
@Index(['userId', 'nextReview'])
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  term: string;

  @Column()
  meaning: string;

  @Column({ type: 'enum', enum: WordType })
  type: WordType;

  @Column({ nullable: true })
  phonetic: string;

  @Column({ nullable: true })
  example: string;

  // SRS fields (SM-2)
  @Column({ type: 'float', default: 2.5 })
  easeFactor: number;

  @Column({ default: 1 })
  interval: number;

  @Column({ default: 0 })
  repetition: number;

  @Column()
  nextReview: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.words, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CollectionWord, (cw) => cw.word)
  collections: CollectionWord[];

  @OneToMany(() => ReviewLog, (reviewLog) => reviewLog.word)
  reviewLogs: ReviewLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
