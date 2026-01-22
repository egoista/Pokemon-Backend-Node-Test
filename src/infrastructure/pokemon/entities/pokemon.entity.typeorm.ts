import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('pokemons')
export class PokemonEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}
