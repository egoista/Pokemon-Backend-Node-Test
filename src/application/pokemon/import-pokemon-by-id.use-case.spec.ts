import { ImportPokemonByIdUseCase } from './import-pokemon-by-id.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { PokeApiClient, PokeApiPokemonDto } from './ports/poke-api.client.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { Type } from '../../domain/type.entity';
import { ValidationError } from '../shared/errors/application.errors';

describe('ImportPokemonByIdUseCase', () => {
    let useCase: ImportPokemonByIdUseCase;
    let pokemonRepository: PokemonRepository;
    let pokeApiClient: PokeApiClient;

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

        pokeApiClient = {
            getPokemonById: jest.fn(),
        } as any; // Mock partial implementation

        useCase = new ImportPokemonByIdUseCase(pokemonRepository, pokeApiClient);
    });

    it('should import a pokemon successfully', async () => {
        const id = 158;
        const pokeApiDto: PokeApiPokemonDto = {
            id,
            name: 'totodile',
            types: [{ type: { name: 'water' } }],
        };

        const importedPokemon = new Pokemon(
            id,
            'totodile',
            [new Type('water', expect.any(Date))],
        );

        (pokeApiClient.getPokemonById as jest.Mock).mockResolvedValue(pokeApiDto);
        (pokemonRepository.upsert as jest.Mock).mockResolvedValue(importedPokemon);

        const result = await useCase.execute({ id });

        expect(pokeApiClient.getPokemonById).toHaveBeenCalledWith(id);
        expect(pokemonRepository.upsert).toHaveBeenCalledWith(expect.any(Pokemon));
        const savedPokemon = (pokemonRepository.upsert as jest.Mock).mock.calls[0][0];
        expect(savedPokemon.id).toBe(id);
        expect(savedPokemon.name).toBe('totodile');
        expect(savedPokemon.types[0].name).toBe('water');
        expect(result).toEqual(importedPokemon);
    });

    it('should throw ValidationError if id is invalid', async () => {
        await expect(useCase.execute({ id: -1 })).rejects.toThrow(ValidationError);
        await expect(useCase.execute({ id: 0 })).rejects.toThrow(ValidationError);
        expect(pokeApiClient.getPokemonById).not.toHaveBeenCalled();
    });

    it('should propagate errors from PokeApiClient', async () => {
        const id = 999;
        const error = new Error('PokeAPI Error');
        (pokeApiClient.getPokemonById as jest.Mock).mockRejectedValue(error);

        await expect(useCase.execute({ id })).rejects.toThrow(error);
    });
});
