import {
  PokemonResolver,
  CreatePokemonResultResolver,
} from './pokemon.resolver';
import { CreatePokemonUseCase } from '../../../application/pokemon/create-pokemon.use-case';
import { ListPokemonsUseCase } from '../../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../../application/pokemon/delete-pokemon.use-case';
import { ImportPokemonByIdUseCase } from '../../../application/pokemon/import-pokemon-by-id.use-case';
import { PokemonAlreadyExistsError } from '../../../domain/pokemon/pokemon.errors';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { Type } from '../../../domain/type.entity';

describe('PokemonResolver', () => {
  let createPokemonUseCase: { execute: jest.Mock };
  let listPokemonsUseCase: { execute: jest.Mock };
  let updatePokemonUseCase: { execute: jest.Mock };
  let deletePokemonUseCase: { execute: jest.Mock };
  let importPokemonByIdUseCase: { execute: jest.Mock };
  let resolver: PokemonResolver;

  beforeEach(() => {
    createPokemonUseCase = { execute: jest.fn() };
    listPokemonsUseCase = { execute: jest.fn() };
    updatePokemonUseCase = { execute: jest.fn() };
    deletePokemonUseCase = { execute: jest.fn() };
    importPokemonByIdUseCase = { execute: jest.fn() };

    resolver = new PokemonResolver(
      createPokemonUseCase as unknown as CreatePokemonUseCase,
      listPokemonsUseCase as unknown as ListPokemonsUseCase,
      updatePokemonUseCase as unknown as UpdatePokemonUseCase,
      deletePokemonUseCase as unknown as DeletePokemonUseCase,
      importPokemonByIdUseCase as unknown as ImportPokemonByIdUseCase,
    );
  });

  it('returns union error payload when pokemon already exists', async () => {
    createPokemonUseCase.execute.mockRejectedValue(
      new PokemonAlreadyExistsError('Pikachu'),
    );

    const result = await resolver.create({
      input: { id: 25, name: 'Pikachu', types: ['Electric'] },
    });

    expect(result).toEqual({
      __typename: 'PokemonAlreadyExistsError',
      message: 'Pokemon with name Pikachu already exists.',
    });
    expect(createPokemonUseCase.execute).toHaveBeenCalledWith({
      id: 25,
      name: 'Pikachu',
      types: ['Electric'],
    });
  });

  it('rethrows unexpected errors', async () => {
    const error = new Error('boom');
    createPokemonUseCase.execute.mockRejectedValue(error);

    await expect(
      resolver.create({
        input: { id: 1, name: 'Bulbasaur', types: ['Grass'] },
      }),
    ).rejects.toThrow('boom');
  });

  it('coerces id to number on delete', async () => {
    deletePokemonUseCase.execute.mockResolvedValue(undefined);

    const result = await resolver.delete('7' as unknown as number);

    expect(deletePokemonUseCase.execute).toHaveBeenCalledWith(7);
    expect(result).toBe(true);
  });

  it('maps imported pokemon to presenter', async () => {
    const createdAt = new Date('2024-01-02T03:04:05.000Z');
    const pokemon = new Pokemon(
      25,
      'Pikachu',
      [new Type('Electric', new Date('2024-01-01T00:00:00.000Z'))],
      createdAt,
    );
    importPokemonByIdUseCase.execute.mockResolvedValue(pokemon);

    const result = await resolver.importPokemon(25);

    expect(importPokemonByIdUseCase.execute).toHaveBeenCalledWith({ id: 25 });
    expect(result.id).toBe(25);
    expect(result.name).toBe('Pikachu');
    expect(result.types).toHaveLength(1);
    expect(result.created_at).toBe(createdAt.toISOString());
  });
});

describe('CreatePokemonResultResolver', () => {
  it('resolves union types based on value shape', () => {
    const resolver = new CreatePokemonResultResolver();

    expect(resolver.__resolveType({ id: 1, name: 'Pikachu' })).toBe('Pokemon');
    expect(resolver.__resolveType({ message: 'exists' })).toBe(
      'PokemonAlreadyExistsError',
    );
    expect(resolver.__resolveType({})).toBeNull();
  });
});
