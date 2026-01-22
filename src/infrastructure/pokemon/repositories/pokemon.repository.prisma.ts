import { Injectable } from '@nestjs/common';
import { PokemonListFilters, PokemonListResult, PokemonRepository } from '../../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { PrismaService } from '../../prisma/prisma.service';

// ARCH: Infrastructure adapter mapping persistence <-> domain entity.
// ADR-004: Multiple ORMs via repository abstraction. ADR-012: Domain identifier as PK.
@Injectable()
export class PokemonRepositoryPrisma implements PokemonRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByName(name: string): Promise<Pokemon | null> {
        const prismaPokemon = await this.prisma.pokemon.findFirst({
            where: { name },
        });

        if (!prismaPokemon) {
            return null;
        }

        return new Pokemon(
            prismaPokemon.id,
            prismaPokemon.name,
            prismaPokemon.type,
            prismaPokemon.created_at,
        );
    }

    async save(pokemon: Pokemon): Promise<Pokemon> {
        const savedPrismaPokemon = await this.prisma.pokemon.create({
            data: {
                id: pokemon.id,
                name: pokemon.name,
                type: pokemon.type,
                created_at: pokemon.createdAt,
            },
        });

        return new Pokemon(
            savedPrismaPokemon.id,
            savedPrismaPokemon.name,
            savedPrismaPokemon.type,
            savedPrismaPokemon.created_at,
        );
    }

    async findById(id: number): Promise<Pokemon | null> {
        const prismaPokemon = await this.prisma.pokemon.findUnique({
            where: { id },
        });

        if (!prismaPokemon) {
            return null;
        }

        return new Pokemon(
            prismaPokemon.id,
            prismaPokemon.name,
            prismaPokemon.type,
            prismaPokemon.created_at,
        );
    }

    async findAll(): Promise<Pokemon[]> {
        const prismaPokemons = await this.prisma.pokemon.findMany({
            orderBy: { id: 'asc' },
        });

        return prismaPokemons.map(
            (p) => new Pokemon(p.id, p.name, p.type, p.created_at)
        );
    }

    async findWithFilters(filters: PokemonListFilters): Promise<PokemonListResult> {
        const where: Record<string, unknown> = {};

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.name) {
            where.name = {
                contains: filters.name,
            };
        }

        const [totalCount, prismaPokemons] = await this.prisma.$transaction([
            this.prisma.pokemon.count({ where }),
            this.prisma.pokemon.findMany({
                where,
                orderBy: { [filters.sortBy]: filters.sortOrder },
                skip: filters.offset,
                take: filters.limit,
            }),
        ]);

        return {
            totalCount,
            data: prismaPokemons.map(
                (p) => new Pokemon(p.id, p.name, p.type, p.created_at)
            ),
        };
    }

    async update(pokemon: Pokemon): Promise<Pokemon> {
        const updatedPrismaPokemon = await this.prisma.pokemon.update({
            where: { id: pokemon.id },
            data: {
                name: pokemon.name,
                type: pokemon.type,
            },
        });

        return new Pokemon(
            updatedPrismaPokemon.id,
            updatedPrismaPokemon.name,
            updatedPrismaPokemon.type,
            updatedPrismaPokemon.created_at,
        );
    }

    async delete(id: number): Promise<void> {
        await this.prisma.pokemon.delete({
            where: { id },
        });
    }
}
