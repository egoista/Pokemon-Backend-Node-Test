import { GetPokemonByIdUseCase } from './get-pokemon-by-id.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';

import { Type } from '../../domain/type.entity';
import { ValidationError } from '../shared/errors/application.errors';

describe('GetPokemonByIdUseCase', () => {
  let useCase: GetPokemonByIdUseCase;
  let pokemonRepository: PokemonRepository;

  beforeEach(() => {
    pokemonRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      findWithFilters: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetPokemonByIdUseCase(pokemonRepository);
  });

  it('should return pokemon when it exists', async () => {
    const pokemonId = 1;
    const expectedPokemon = new Pokemon(
      pokemonId,
      'Pikachu',
      [new Type('Electric', new Date(), 1)],
      new Date(),
    );
    (pokemonRepository.findById as jest.Mock).mockResolvedValue(
      expectedPokemon,
    );

    const result = await useCase.execute(pokemonId);

    expect(pokemonRepository.findById).toHaveBeenCalledWith(pokemonId);
    expect(result).toEqual(expectedPokemon);
  });

  it('should throw PokemonNotFoundError when pokemon does not exist', async () => {
    const pokemonId = 999;
    (pokemonRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(pokemonId)).rejects.toThrow(
      PokemonNotFoundError,
    );
    expect(pokemonRepository.findById).toHaveBeenCalledWith(pokemonId);
  });

  it('should throw ValidationError for invalid id', async () => {
    await expect(useCase.execute(0)).rejects.toThrow(ValidationError);
    await expect(useCase.execute(-5)).rejects.toThrow(ValidationError);
    await expect(useCase.execute(1.1)).rejects.toThrow(ValidationError);
    expect(pokemonRepository.findById).not.toHaveBeenCalled();
  });
});
