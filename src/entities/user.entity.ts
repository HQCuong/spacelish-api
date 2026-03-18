import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Token } from './token.entity';
import { Word } from './word.entity';
import { Collection } from './collection.entity';
import { ReviewLog } from './review-log.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Word, (word) => word.user)
  words: Word[];

  @OneToMany(() => Collection, (collection) => collection.user)
  collections: Collection[];

  @OneToMany(() => ReviewLog, (reviewLog) => reviewLog.user)
  reviewLogs: ReviewLog[];
}
