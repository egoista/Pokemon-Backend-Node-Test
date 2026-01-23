import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { PokemonEntity } from './pokemon.entity.typeorm';
import { TypeEntity } from './type.entity.typeorm';

describe('TypeORM entities metadata', () => {
    it('registers columns and relations for pokemon and type entities', () => {
        const storage = getMetadataArgsStorage();

        const pokemonRelations = storage.relations.filter(
            (relation) => relation.target === PokemonEntity,
        );
        const typeRelations = storage.relations.filter(
            (relation) => relation.target === TypeEntity,
        );
        const pokemonColumns = storage.columns.filter(
            (column) => column.target === PokemonEntity,
        );
        const typeColumns = storage.columns.filter(
            (column) => column.target === TypeEntity,
        );

        expect(pokemonRelations.some((relation) => relation.propertyName === 'types')).toBe(true);
        expect(typeRelations.some((relation) => relation.propertyName === 'pokemons')).toBe(true);
        expect(pokemonColumns.some((column) => column.propertyName === 'created_at')).toBe(true);
        expect(typeColumns.some((column) => column.propertyName === 'created_at')).toBe(true);
    });

    it('allows instantiation and property assignment', () => {
        const pokemon = new PokemonEntity();
        const type = new TypeEntity();

        pokemon.id = 1;
        pokemon.name = 'Pikachu';
        pokemon.types = [];
        pokemon.created_at = new Date('2024-01-01T00:00:00.000Z');

        type.id = 1;
        type.name = 'Electric';
        type.created_at = new Date('2024-01-02T00:00:00.000Z');
        type.pokemons = [];

        expect(pokemon.id).toBe(1);
        expect(pokemon.name).toBe('Pikachu');
        expect(type.name).toBe('Electric');
    });
});
