import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { TypeEntity } from './type.entity.typeorm';

@Entity('pokemons')
export class PokemonEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => TypeEntity, (type) => type.pokemons, { cascade: ['insert', 'update'] })
    @JoinTable({
        name: '_PokemonToType',
        joinColumn: { name: 'A', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'B', referencedColumnName: 'id' }
    })
    types: TypeEntity[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}
