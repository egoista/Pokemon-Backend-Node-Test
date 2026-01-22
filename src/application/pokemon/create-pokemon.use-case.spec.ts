import { CreatePokemonUseCase } from './create-pokemon.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import {
    PokemonAlreadyExistsError,
    InvalidPokemonIdError,
    InvalidPokemonNameError,
    InvalidPokemonTypeError,
} from '../../domain/pokemon/pokemon.errors';

describe('CreatePokemonUseCase', () => {
    let useCase: CreatePokemonUseCase;
    let pokemonRepository: PokemonRepository;

    beforeEach(() => {
        pokemonRepository = {
            findByName: jest.fn(),
            save: jest.fn(),
        };
        useCase = new CreatePokemonUseCase(pokemonRepository);
    });

    it('should create a pokemon successfully', async () => {
        // Arrange
        const input = { id: 1, name: 'Pikachu', type: 'Electric' };
        // We create a valid entity for the mock to return
        const savedPokemon = new Pokemon(1, 'Pikachu', 'Electric', new Date());

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.save as jest.Mock).mockResolvedValue(savedPokemon);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(pokemonRepository.findByName).toHaveBeenCalledWith('Pikachu');
        expect(pokemonRepository.save).toHaveBeenCalled();
        expect(result).toEqual(savedPokemon);
    });

    it('should throw PokemonAlreadyExistsError if pokemon with same name exists', async () => {
        // Arrange
        const input = { id: 1, name: 'Pikachu', type: 'Electric' };
        const existingPokemon = new Pokemon(1, 'Pikachu', 'Electric', new Date());

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(existingPokemon);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(PokemonAlreadyExistsError);
        expect(pokemonRepository.findByName).toHaveBeenCalledWith('Pikachu');
        expect(pokemonRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if name is empty', async () => {
        // Arrange
        const input = { id: 1, name: '', type: 'Electric' };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(InvalidPokemonNameError);
    });

    it('should throw error if type is empty', async () => {
        // Arrange
        const input = { id: 1, name: 'Pikachu', type: '' };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(InvalidPokemonTypeError);
    });

    it('should throw error if id is invalid', async () => {
        // Arrange
        const input = { id: -1, name: 'Pikachu', type: 'Electric' };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(InvalidPokemonIdError);
    });
});
