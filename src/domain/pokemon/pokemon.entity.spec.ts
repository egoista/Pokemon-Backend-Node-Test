import { Pokemon } from './pokemon.entity';
import { Type } from '../type.entity';
import {
  InvalidPokemonIdError,
  InvalidPokemonNameError,
  InvalidPokemonTypeError,
} from './pokemon.errors';

describe('Pokemon Entity', () => {
  const typeElectric = new Type('Electric', new Date(), 1);
  const typeSteel = new Type('Steel', new Date(), 2);

  it('should create a valid pokemon', () => {
    const pokemon = new Pokemon(1, 'Pikachu', [typeElectric]);
    expect(pokemon).toBeDefined();
    expect(pokemon.id).toBe(1);
    expect(pokemon.name).toBe('Pikachu');
    expect(pokemon.types).toHaveLength(1);
    expect(pokemon.types[0].name).toBe('Electric');
    expect(pokemon.createdAt).toBeInstanceOf(Date);
  });

  it('should throw an error when ID is invalid', () => {
    expect(() => new Pokemon(0, 'Pikachu', [typeElectric])).toThrow(
      InvalidPokemonIdError,
    );
    expect(() => new Pokemon(-5, 'Pikachu', [typeElectric])).toThrow(
      InvalidPokemonIdError,
    );
    expect(() => new Pokemon(1.5, 'Pikachu', [typeElectric])).toThrow(
      InvalidPokemonIdError,
    );
  });

  it('should throw an error when name is empty', () => {
    expect(() => new Pokemon(1, '', [typeElectric])).toThrow(
      InvalidPokemonNameError,
    );
  });

  it('should throw an error when name is whitespace', () => {
    expect(() => new Pokemon(1, '   ', [typeElectric])).toThrow(
      InvalidPokemonNameError,
    );
  });

  it('should throw an error when types list is empty', () => {
    expect(() => new Pokemon(1, 'Pikachu', [])).toThrow(
      InvalidPokemonTypeError,
    );
  });

  it('should utilize provided createdAt date', () => {
    const date = new Date('2023-01-01');
    const pokemon = new Pokemon(
      1,
      'Bulbasaur',
      [new Type('Grass', new Date(), 3)],
      date,
    );
    expect(pokemon.createdAt).toBe(date);
    expect(pokemon.createdAt.toISOString()).toBe('2023-01-01T00:00:00.000Z');
  });

  it('should create a new date if createdAt is not provided', () => {
    const before = new Date();
    const pokemon = new Pokemon(1, 'Charmander', [
      new Type('Fire', new Date(), 4),
    ]);
    const after = new Date();

    expect(pokemon.createdAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(pokemon.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should allow updating name via setter', () => {
    const pokemon = new Pokemon(1, 'Pikachu', [typeElectric]);
    pokemon.name = 'Raichu';
    expect(pokemon.name).toBe('Raichu');
  });

  it('should validate name update via setter', () => {
    const pokemon = new Pokemon(1, 'Pikachu', [typeElectric]);
    expect(() => {
      pokemon.name = '';
    }).toThrow(InvalidPokemonNameError);
  });

  it('should allow updating types via setter', () => {
    const pokemon = new Pokemon(1, 'Pikachu', [typeElectric]);
    pokemon.types = [typeElectric, typeSteel];
    expect(pokemon.types).toHaveLength(2);
  });

  it('should validate types update via setter', () => {
    const pokemon = new Pokemon(1, 'Pikachu', [typeElectric]);
    expect(() => {
      pokemon.types = [];
    }).toThrow(InvalidPokemonTypeError);
  });
});
