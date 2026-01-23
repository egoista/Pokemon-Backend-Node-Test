import { ListPokemonsUseCase } from './list-pokemons.use-case';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { Type } from '../../domain/type.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { ValidationError } from '../shared/errors/application.errors';

describe('ListPokemonsUseCase', () => {
    let useCase: ListPokemonsUseCase;
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
        useCase = new ListPokemonsUseCase(pokemonRepository);
    });

    it('should list pokemons with pagination metadata', async () => {
        const pikachu = new Pokemon(1, 'Pikachu', [new Type('Electric', new Date(), 1)], new Date());
        const bulbasaur = new Pokemon(2, 'Bulbasaur', [new Type('Grass', new Date(), 2)], new Date());

        (pokemonRepository.findWithFilters as jest.Mock).mockResolvedValue({
            data: [pikachu, bulbasaur],
            totalCount: 2,
        });

        const result = await useCase.execute({ page: 1, limit: 2 });

        expect(pokemonRepository.findWithFilters).toHaveBeenCalledWith({
            type: undefined,
            name: undefined,
            sortBy: 'name',
            sortOrder: 'asc',
            offset: 0,
            limit: 2,
        });
        expect(result.data).toEqual([pikachu, bulbasaur]);
        expect(result.pagination).toEqual({
            page: 1,
            limit: 2,
            totalCount: 2,
            totalPages: 1,
        });
    });

    it('should validate page and limit', async () => {
        await expect(useCase.execute({ page: 0 })).rejects.toThrow(ValidationError);
        await expect(useCase.execute({ limit: 0 })).rejects.toThrow(ValidationError);
        await expect(useCase.execute({ limit: 101 })).rejects.toThrow(ValidationError);
    });

    it('should allow supported sortBy values', async () => {
        (pokemonRepository.findWithFilters as jest.Mock).mockResolvedValue({
            data: [],
            totalCount: 0,
        });

        await useCase.execute({ sortBy: 'id' });
        await useCase.execute({ sortBy: 'type' });
        await useCase.execute({ sortBy: 'created_at' });
    });

    it('should validate sortBy and sortOrder', async () => {
        await expect(useCase.execute({ sortBy: 'invalid' })).rejects.toThrow(ValidationError);
        await expect(useCase.execute({ sortOrder: 'invalid' })).rejects.toThrow(ValidationError);
    });
});
