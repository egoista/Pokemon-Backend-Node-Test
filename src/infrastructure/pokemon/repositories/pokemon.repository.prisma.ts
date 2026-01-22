import { Injectable } from '@nestjs/common';
import { PokemonRepository } from '../../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { PrismaService } from '../../prisma/prisma.service';

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
