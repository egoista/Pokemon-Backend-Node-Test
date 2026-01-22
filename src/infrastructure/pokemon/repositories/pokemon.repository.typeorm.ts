import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonListFilters, PokemonListResult, PokemonRepository } from '../../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { Type } from '../../../domain/type.entity';
import { PokemonEntity } from '../entities/pokemon.entity.typeorm';
import { TypeEntity } from '../entities/type.entity.typeorm';

// ARCH: Infrastructure adapter mapping persistence <-> domain entity.
// ADR-004: Multiple ORMs via repository abstraction. ADR-012: Domain identifier as PK.
@Injectable()
export class PokemonRepositoryTypeORM implements PokemonRepository {
    constructor(
        @InjectRepository(PokemonEntity)
        private readonly repository: Repository<PokemonEntity>,
        @InjectRepository(TypeEntity)
        private readonly typeRepository: Repository<TypeEntity>
    ) { }

    async findById(id: number): Promise<Pokemon | null> {
        const entity = await this.repository.findOne({
            where: { id },
            relations: ['types'],
        });

        if (!entity) {
            return null;
        }

        return this.mapToDomain(entity);
    }

    async findByName(name: string): Promise<Pokemon | null> {
        const entity = await this.repository.findOne({
            where: { name },
            relations: ['types'],
        });

        if (!entity) {
            return null;
        }

        return this.mapToDomain(entity);
    }

    async findAll(): Promise<Pokemon[]> {
        const entities = await this.repository.find({
            order: { id: 'ASC' },
            relations: ['types'],
        });

        return entities.map((e) => this.mapToDomain(e));
    }

    async findWithFilters(filters: PokemonListFilters): Promise<PokemonListResult> {
        const query = this.repository.createQueryBuilder('pokemon');
        query.leftJoinAndSelect('pokemon.types', 'type');

        if (filters.type) {
            // Filter where at least one type matches
            query.andWhere('type.name = :type', { type: filters.type });
        }

        if (filters.name) {
            query.andWhere('LOWER(pokemon.name) LIKE :name', {
                name: `%${filters.name.toLowerCase()}%`,
            });
        }

        query
            .orderBy(`pokemon.${filters.sortBy}`, filters.sortOrder.toUpperCase() as 'ASC' | 'DESC')
            .skip(filters.offset)
            .take(filters.limit);

        const [entities, totalCount] = await query.getManyAndCount();

        return {
            totalCount,
            data: entities.map((e) => this.mapToDomain(e)),
        };
    }

    async save(pokemon: Pokemon): Promise<Pokemon> {
        // Resolve types
        const typeEntities = await this.resolveTypes(pokemon.types);

        const entity = this.repository.create({
            id: pokemon.id,
            name: pokemon.name,
            types: typeEntities,
            created_at: pokemon.createdAt,
        });

        const saved = await this.repository.save(entity);

        return this.mapToDomain(saved);
    }

    async update(pokemon: Pokemon): Promise<Pokemon> {
        // Resolve types
        const typeEntities = await this.resolveTypes(pokemon.types);

        // Preload checks if entity exists and merges data
        const entity = await this.repository.preload({
            id: pokemon.id,
            name: pokemon.name,
            types: typeEntities,
        });

        if (!entity) {
            // Should not happen if use case guarantees existence, but for safety
            return this.save(pokemon);
        }

        const updated = await this.repository.save(entity);

        return this.mapToDomain(updated);
    }

    async upsert(pokemon: Pokemon): Promise<Pokemon> {
        // For TypeORM, save() acts as upsert if ID is present
        return this.save(pokemon);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete({ id });
    }

    private mapToDomain(entity: PokemonEntity): Pokemon {
        return new Pokemon(
            entity.id,
            entity.name,
            (entity.types || []).map((t) => new Type(t.id, t.name, t.created_at)),
            entity.created_at,
        );
    }

    private async resolveTypes(types: Type[]): Promise<TypeEntity[]> {
        const typeEntities: TypeEntity[] = [];
        for (const t of types) {
            let typeEntity = await this.typeRepository.findOne({ where: { name: t.name } });
            if (!typeEntity) {
                typeEntity = this.typeRepository.create({ name: t.name });
                typeEntity = await this.typeRepository.save(typeEntity);
            }
            typeEntities.push(typeEntity);
        }
        return typeEntities;
    }
}
