import { PokemonController } from './pokemon.controller';
import { CreatePokemonUseCase } from '../../../application/pokemon/create-pokemon.use-case';
import { GetPokemonByIdUseCase } from '../../../application/pokemon/get-pokemon-by-id.use-case';
import { ListPokemonsUseCase } from '../../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../../application/pokemon/delete-pokemon.use-case';
import { ImportPokemonByIdUseCase } from '../../../application/pokemon/import-pokemon-by-id.use-case';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { Type } from '../../../domain/type.entity';

describe('PokemonController', () => {
  let controller: PokemonController;
  let getPokemonByIdUseCase: { execute: jest.Mock };
  let importPokemonByIdUseCase: { execute: jest.Mock };

  beforeEach(() => {
    const createPokemonUseCase = { execute: jest.fn() };
    getPokemonByIdUseCase = { execute: jest.fn() };
    const listPokemonsUseCase = { execute: jest.fn() };
    const updatePokemonUseCase = { execute: jest.fn() };
    const deletePokemonUseCase = { execute: jest.fn() };
    importPokemonByIdUseCase = { execute: jest.fn() };

    controller = new PokemonController(
      createPokemonUseCase as unknown as CreatePokemonUseCase,
      getPokemonByIdUseCase as unknown as GetPokemonByIdUseCase,
      listPokemonsUseCase as unknown as ListPokemonsUseCase,
      updatePokemonUseCase as unknown as UpdatePokemonUseCase,
      deletePokemonUseCase as unknown as DeletePokemonUseCase,
      importPokemonByIdUseCase as unknown as ImportPokemonByIdUseCase,
    );
  });

  it('returns presenter for getById', async () => {
    const createdAt = new Date('2024-02-01T00:00:00.000Z');
    const pokemon = new Pokemon(
      1,
      'Pikachu',
      [new Type('Electric', createdAt, 1)],
      createdAt,
    );

    getPokemonByIdUseCase.execute.mockResolvedValue(pokemon);

    const result = await controller.getById(1);

    expect(getPokemonByIdUseCase.execute).toHaveBeenCalledWith(1);
    expect(result.id).toBe(1);
    expect(result.name).toBe('Pikachu');
    expect(result.created_at).toBe(createdAt.toISOString());
  });

  it('returns presenter for import', async () => {
    const createdAt = new Date('2024-03-01T00:00:00.000Z');
    const pokemon = new Pokemon(
      25,
      'Pikachu',
      [new Type('Electric', createdAt, 1)],
      createdAt,
    );

    importPokemonByIdUseCase.execute.mockResolvedValue(pokemon);

    const result = await controller.import({ id: 25 });

    expect(importPokemonByIdUseCase.execute).toHaveBeenCalledWith({ id: 25 });
    expect(result.id).toBe(25);
    expect(result.name).toBe('Pikachu');
    expect(result.created_at).toBe(createdAt.toISOString());
  });
});
