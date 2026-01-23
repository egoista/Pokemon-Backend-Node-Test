import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokeApiClient, PokeApiPokemonDto } from './ports/poke-api.client.interface';
import { ValidationError } from '../shared/errors/application.errors';
import { Type } from '../../domain/type.entity';
import { AppLogger, NullLogger } from '../shared/logger/logger.interface';

export interface ImportPokemonInput {
    id: number;
}

export class ImportPokemonByIdUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository,
        private readonly pokeApiClient: PokeApiClient,
        private readonly logger: AppLogger = new NullLogger(),
    ) { }

    async execute(input: ImportPokemonInput): Promise<Pokemon> {
        this.validateInput(input);
        const { id } = input;

        // 1. Fetch from external API
        let pokeApiDto: PokeApiPokemonDto;
        try {
            pokeApiDto = await this.pokeApiClient.getPokemonById(id);
        } catch (error) {
            this.logger.error('pokemon.import_failed', {
                pokemonId: id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }

        // 2. Map to domain entities
        const types = pokeApiDto.types.map(
            (t) => new Type(t.type.name, new Date())
        );

        // We use the ID from PokeAPI
        const pokemon = new Pokemon(pokeApiDto.id, pokeApiDto.name, types);

        // 3. Upsert to repository
        const savedPokemon = await this.pokemonRepository.upsert(pokemon);
        this.logger.info('pokemon.imported', {
            pokemonId: savedPokemon.id,
            name: savedPokemon.name,
            typesCount: savedPokemon.types.length,
        });
        return savedPokemon;
    }

    private validateInput(input: ImportPokemonInput): void {
        if (!input) {
            throw new ValidationError('Input is required.');
        }
        if (!Number.isInteger(input.id) || input.id <= 0) {
            throw new ValidationError('Pokemon ID must be a positive integer.');
        }
    }
}
