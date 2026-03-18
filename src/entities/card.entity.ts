import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Deck } from './deck.entity';
import { Review } from './review.entity';
import { CardStatus } from '../common/enums/card-status.enum';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deckId: number;

  @Column({ type: 'varchar' })
  word: string;

  @Column({ type: 'text' })
  meaning: string;

  @Column({ type: 'text', nullable: true })
  exampleSentence: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  extraNote: string;

  // SRS fields (SM-2)
  @Column({ type: 'float', default: 2.5 })
  ef: number;

  @Column({ default: 0 })
  repetition: number;

  @Column({ default: 0 })
  intervalDays: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReviewed: Date;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.NEW,
  })
  status: CardStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Deck, (deck) => deck.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deckId' })
  deck: Deck;

  @OneToMany(() => Review, (review) => review.card)
  reviews: Review[];
}
