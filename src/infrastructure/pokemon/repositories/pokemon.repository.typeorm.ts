import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonRepository } from '../../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { PokemonEntity } from '../entities/pokemon.entity.typeorm';

@Injectable()
export class PokemonRepositoryTypeORM implements PokemonRepository {
    constructor(
        @InjectRepository(PokemonEntity)
        private readonly repository: Repository<PokemonEntity>
    ) { }

    async findById(id: number): Promise<Pokemon | null> {
        const entity = await this.repository.findOne({ where: { id } });

        if (!entity) {
            return null;
        }

        return new Pokemon(
            entity.id,
            entity.name,
            entity.type,
            entity.created_at,
        );
    }

    async findByName(name: string): Promise<Pokemon | null> {
        const entity = await this.repository.findOne({ where: { name } });

        if (!entity) {
            return null;
        }

        return new Pokemon(
            entity.id,
            entity.name,
            entity.type,
            entity.created_at,
        );
    }

    async findAll(): Promise<Pokemon[]> {
        const entities = await this.repository.find({
            order: { id: 'ASC' },
        });

        return entities.map(
            (e) => new Pokemon(e.id, e.name, e.type, e.created_at)
        );
    }

    async save(pokemon: Pokemon): Promise<Pokemon> {
        const entity = this.repository.create({
            id: pokemon.id,
            name: pokemon.name,
            type: pokemon.type,
            created_at: pokemon.createdAt,
        });

        const saved = await this.repository.save(entity);

        return new Pokemon(
            saved.id,
            saved.name,
            saved.type,
            saved.created_at,
        );
    }

    async update(pokemon: Pokemon): Promise<Pokemon> {
        await this.repository.update(
            { id: pokemon.id },
            {
                name: pokemon.name,
                type: pokemon.type,
            }
        );

        const updated = await this.repository.findOne({
            where: { id: pokemon.id },
        });

        return new Pokemon(
            updated!.id,
            updated!.name,
            updated!.type,
            updated!.created_at,
        );
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete({ id });
    }
}
