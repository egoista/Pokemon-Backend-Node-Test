import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokeApiClient } from './ports/poke-api.client.interface';
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
  ) {}

  async execute(input: ImportPokemonInput): Promise<Pokemon> {
    this.validateInput(input);
    const { id } = input;

    const pokeApiDto = await this.pokeApiClient.getPokemonById(id);

    const types = pokeApiDto.types.map(
      (t) => new Type(t.type.name, new Date()),
    );

    // ADR-012: Use external API id as the domain identifier on import.
    const pokemon = new Pokemon(pokeApiDto.id, pokeApiDto.name, types);

    return this.pokemonRepository.upsert(pokemon);
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
