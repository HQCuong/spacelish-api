import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Card } from './card.entity';
import { User } from './user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cardId: number;

  @Column()
  userId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reviewedAt: Date;

  @Column()
  quality: number; // 0-5

  @Column({ nullable: true })
  elapsedSeconds: number;

  @Column({ nullable: true })
  oldInterval: number;

  @Column({ nullable: true })
  newInterval: number;

  @Column({ type: 'float', nullable: true })
  oldEf: number;

  @Column({ type: 'float', nullable: true })
  newEf: number;

  @Column({ nullable: true })
  oldRepetition: number;

  @Column({ nullable: true })
  newRepetition: number;

  @ManyToOne(() => Card, (card) => card.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardId' })
  card: Card;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
