import { UpdatePokemonUseCase } from './update-pokemon.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonAlreadyExistsError, PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';

import { ValidationError } from '../shared/errors/application.errors';

describe('UpdatePokemonUseCase', () => {
    let useCase: UpdatePokemonUseCase;
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
        useCase = new UpdatePokemonUseCase(pokemonRepository);
    });

    it('should update name and type successfully', async () => {
        // Arrange
        const input = { id: 1, name: 'Raichu', type: 'Electric' };
        const existingPokemon = new Pokemon(1, 'Pikachu', 'Electric', new Date());
        const updatedPokemon = new Pokemon(1, 'Raichu', 'Electric', existingPokemon.createdAt);

        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.update as jest.Mock).mockResolvedValue(updatedPokemon);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(pokemonRepository.findById).toHaveBeenCalledWith(1);
        expect(pokemonRepository.findByName).toHaveBeenCalledWith('Raichu');
        expect(pokemonRepository.update).toHaveBeenCalledWith(expect.any(Pokemon));
        expect(result.name).toBe('Raichu');
    });

    it('should update only name successfully', async () => {
        // Arrange
        const input = { id: 1, name: 'Raichu' };
        const existingPokemon = new Pokemon(1, 'Pikachu', 'Electric', new Date());
        const updatedPokemon = new Pokemon(1, 'Raichu', 'Electric', existingPokemon.createdAt);

        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.update as jest.Mock).mockResolvedValue(updatedPokemon);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.name).toBe('Raichu');
        expect(result.type).toBe('Electric');
    });

    it('should throw PokemonNotFoundError when pokemon does not exist', async () => {
        // Arrange
        const input = { id: 999, name: 'Raichu' };
        (pokemonRepository.findById as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(PokemonNotFoundError);
    });

    it('should throw PokemonAlreadyExistsError when new name is taken', async () => {
        // Arrange
        const input = { id: 1, name: 'Raichu' };
        const existingPokemon = new Pokemon(1, 'Pikachu', 'Electric', new Date());
        const anotherPokemon = new Pokemon(2, 'Raichu', 'Electric', new Date());

        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(anotherPokemon);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(PokemonAlreadyExistsError);
    });

    it('should throw ValidationError when no update fields are provided', async () => {
        // Arrange
        const input = { id: 1 };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
        expect(pokemonRepository.findById).not.toHaveBeenCalled();
    });
});
