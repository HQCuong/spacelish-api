import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Collection } from './collection.entity';
import { Word } from './word.entity';

@Entity()
export class CollectionWord {
  @PrimaryColumn()
  collectionId: string;

  @PrimaryColumn()
  wordId: string;

  @ManyToOne(() => Collection, (collection) => collection.words, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collectionId' })
  collection: Collection;

  @ManyToOne(() => Word, (word) => word.collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wordId' })
  word: Word;
}
