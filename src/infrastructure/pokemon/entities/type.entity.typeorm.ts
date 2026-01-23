import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { PokemonEntity } from './pokemon.entity.typeorm';

@Entity('types')
export class TypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToMany(() => PokemonEntity, (pokemon) => pokemon.types)
  pokemons: PokemonEntity[];
}
