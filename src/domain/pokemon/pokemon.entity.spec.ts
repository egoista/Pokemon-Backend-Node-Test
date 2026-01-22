import { Pokemon } from './pokemon.entity';
import {
    InvalidPokemonIdError,
    InvalidPokemonNameError,
    InvalidPokemonTypeError,
} from './pokemon.errors';

describe('Pokemon Entity', () => {
    it('should create a valid pokemon', () => {
        const pokemon = new Pokemon(1, 'Pikachu', 'Electric');
        expect(pokemon).toBeDefined();
        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe('Pikachu');
        expect(pokemon.type).toBe('Electric');
        expect(pokemon.createdAt).toBeInstanceOf(Date);
    });

    it('should throw an error when ID is invalid', () => {
        expect(() => new Pokemon(0, 'Pikachu', 'Electric')).toThrow(
            InvalidPokemonIdError,
        );
        expect(() => new Pokemon(-5, 'Pikachu', 'Electric')).toThrow(
            InvalidPokemonIdError,
        );
        expect(() => new Pokemon(1.5, 'Pikachu', 'Electric')).toThrow(
            InvalidPokemonIdError,
        );
    });

    it('should throw an error when name is empty', () => {
        expect(() => new Pokemon(1, '', 'Electric')).toThrow(
            InvalidPokemonNameError,
        );
    });

    it('should throw an error when name is whitespace', () => {
        expect(() => new Pokemon(1, '   ', 'Electric')).toThrow(
            InvalidPokemonNameError,
        );
    });

    it('should throw an error when type is empty', () => {
        expect(() => new Pokemon(1, 'Pikachu', '')).toThrow(
            InvalidPokemonTypeError,
        );
    });

    it('should throw an error when type is whitespace', () => {
        expect(() => new Pokemon(1, 'Pikachu', '   ')).toThrow(
            InvalidPokemonTypeError,
        );
    });

    it('should utilize provided createdAt date', () => {
        const date = new Date('2023-01-01');
        const pokemon = new Pokemon(1, 'Bulbasaur', 'Grass', date);
        expect(pokemon.createdAt).toBe(date);
        expect(pokemon.createdAt.toISOString()).toBe(
            '2023-01-01T00:00:00.000Z',
        );
    });

    it('should create a new date if createdAt is not provided', () => {
        const before = new Date();
        const pokemon = new Pokemon(1, 'Charmander', 'Fire');
        const after = new Date();

        expect(pokemon.createdAt.getTime()).toBeGreaterThanOrEqual(
            before.getTime(),
        );
        expect(pokemon.createdAt.getTime()).toBeLessThanOrEqual(
            after.getTime(),
        );
    });

    it('should allow updating name via setter', () => {
        const pokemon = new Pokemon(1, 'Pikachu', 'Electric');
        pokemon.name = 'Raichu';
        expect(pokemon.name).toBe('Raichu');
    });

    it('should validate name update via setter', () => {
        const pokemon = new Pokemon(1, 'Pikachu', 'Electric');
        expect(() => {
            pokemon.name = '';
        }).toThrow(InvalidPokemonNameError);
    });

    it('should allow updating type via setter', () => {
        const pokemon = new Pokemon(1, 'Pikachu', 'Electric');
        pokemon.type = 'Electric/Steel'; // Just an example
        expect(pokemon.type).toBe('Electric/Steel');
    });

    it('should validate type update via setter', () => {
        const pokemon = new Pokemon(1, 'Pikachu', 'Electric');
        expect(() => {
            pokemon.type = '';
        }).toThrow(InvalidPokemonTypeError);
    });
});
