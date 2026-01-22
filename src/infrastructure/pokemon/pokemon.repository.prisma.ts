import { Injectable } from '@nestjs/common';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PrismaService } from '../../modules/prisma/prisma.service';

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
}
