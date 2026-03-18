import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CollectionWord } from './collection-word.entity';

@Entity()
@Unique(['userId', 'name'])
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CollectionWord, (cw) => cw.collection)
  words: CollectionWord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
