import { Injectable } from '@nestjs/common';
import { PokemonListFilters, PokemonListResult, PokemonRepository } from '../../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { Type } from '../../../domain/type.entity';
import { PrismaService } from '../../prisma/prisma.service';

// ARCH: Infrastructure adapter mapping persistence <-> domain entity.
// ADR-004: Multiple ORMs via repository abstraction. ADR-012: Domain identifier as PK.
@Injectable()
export class PokemonRepositoryPrisma implements PokemonRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByName(name: string): Promise<Pokemon | null> {
        const prismaPokemon = await this.prisma.pokemon.findFirst({
            where: { name },
            include: { types: true },
        });

        if (!prismaPokemon) {
            return null;
        }

        return this.mapToDomain(prismaPokemon);
    }

    async save(pokemon: Pokemon): Promise<Pokemon> {
        const savedPrismaPokemon = await this.prisma.pokemon.create({
            data: {
                id: pokemon.id,
                name: pokemon.name,
                created_at: pokemon.createdAt,
                types: {
                    connectOrCreate: pokemon.types.map((type) => ({
                        where: { name: type.name },
                        create: { name: type.name },
                    })),
                },
            },
            include: { types: true },
        });

        return this.mapToDomain(savedPrismaPokemon);
    }

    async findById(id: number): Promise<Pokemon | null> {
        const prismaPokemon = await this.prisma.pokemon.findUnique({
            where: { id },
            include: { types: true },
        });

        if (!prismaPokemon) {
            return null;
        }

        return this.mapToDomain(prismaPokemon);
    }

    async findAll(): Promise<Pokemon[]> {
        const prismaPokemons = await this.prisma.pokemon.findMany({
            orderBy: { id: 'asc' },
            include: { types: true },
        });

        return prismaPokemons.map((p) => this.mapToDomain(p));
    }

    async findWithFilters(filters: PokemonListFilters): Promise<PokemonListResult> {
        const where: Record<string, unknown> = {};

        if (filters.type) {
            where.types = {
                some: {
                    name: filters.type,
                },
            };
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
                include: { types: true },
            }),
        ]);

        return {
            totalCount,
            data: prismaPokemons.map((p) => this.mapToDomain(p)),
        };
    }

    async update(pokemon: Pokemon): Promise<Pokemon> {
        const updatedPrismaPokemon = await this.prisma.pokemon.update({
            where: { id: pokemon.id },
            data: {
                name: pokemon.name,
                types: {
                    // NOTE: Reset type relations to match the incoming list.
                    set: [],
                    connectOrCreate: pokemon.types.map((type) => ({
                        where: { name: type.name },
                        create: { name: type.name },
                    })),
                },
            },
            include: { types: true },
        });

        return this.mapToDomain(updatedPrismaPokemon);
    }

    async upsert(pokemon: Pokemon): Promise<Pokemon> {
        const upsertedPrismaPokemon = await this.prisma.pokemon.upsert({
            where: { id: pokemon.id },
            update: {
                name: pokemon.name,
                types: {
                    // NOTE: Reset type relations to match the incoming list.
                    set: [],
                    connectOrCreate: pokemon.types.map((type) => ({
                        where: { name: type.name },
                        create: { name: type.name },
                    })),
                },
            },
            create: {
                id: pokemon.id,
                name: pokemon.name,
                created_at: pokemon.createdAt,
                types: {
                    connectOrCreate: pokemon.types.map((type) => ({
                        where: { name: type.name },
                        create: { name: type.name },
                    })),
                },
            },
            include: { types: true },
        });

        return this.mapToDomain(upsertedPrismaPokemon);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.pokemon.delete({
            where: { id },
        });
    }

    private mapToDomain(prismaPokemon: any): Pokemon {
        return new Pokemon(
            prismaPokemon.id,
            prismaPokemon.name,
            prismaPokemon.types.map(
                (t: any) => new Type(t.name, t.created_at, t.id)
            ),
            prismaPokemon.created_at,
        );
    }
}
