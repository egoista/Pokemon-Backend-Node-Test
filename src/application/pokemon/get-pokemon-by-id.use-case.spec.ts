import { GetPokemonByIdUseCase } from './get-pokemon-by-id.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';

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
            delete: jest.fn(),
        };
        useCase = new GetPokemonByIdUseCase(pokemonRepository);
    });

    it('should return pokemon when it exists', async () => {
        // Arrange
        const pokemonId = 1;
        const expectedPokemon = new Pokemon(pokemonId, 'Pikachu', 'Electric', new Date());
        (pokemonRepository.findById as jest.Mock).mockResolvedValue(expectedPokemon);

        // Act
        const result = await useCase.execute(pokemonId);

        // Assert
        expect(pokemonRepository.findById).toHaveBeenCalledWith(pokemonId);
        expect(result).toEqual(expectedPokemon);
    });

    it('should throw PokemonNotFoundError when pokemon does not exist', async () => {
        // Arrange
        const pokemonId = 999;
        (pokemonRepository.findById as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.execute(pokemonId)).rejects.toThrow(PokemonNotFoundError);
        expect(pokemonRepository.findById).toHaveBeenCalledWith(pokemonId);
    });
});
