import { UpdatePokemonUseCase } from './update-pokemon.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonAlreadyExistsError, PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';
import { Type } from '../../domain/type.entity';

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
            upsert: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new UpdatePokemonUseCase(pokemonRepository);
    });

    it('should update name and type successfully', async () => {
        // Arrange
        const input = { id: 1, name: 'Raichu', types: ['Electric'] };
        const existingPokemon = new Pokemon(1, 'Pikachu', [new Type(1, 'Electric', new Date())], new Date());
        const updatedPokemon = new Pokemon(1, 'Raichu', [new Type(1, 'Electric', new Date())], existingPokemon.createdAt);

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
        const existingPokemon = new Pokemon(1, 'Pikachu', [new Type(1, 'Electric', new Date())], new Date());
        const updatedPokemon = new Pokemon(1, 'Raichu', [new Type(1, 'Electric', new Date())], existingPokemon.createdAt);

        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.update as jest.Mock).mockResolvedValue(updatedPokemon);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.name).toBe('Raichu');
        expect(result.types[0].name).toBe('Electric');
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
        const existingPokemon = new Pokemon(1, 'Pikachu', [new Type(1, 'Electric', new Date())], new Date());
        const anotherPokemon = new Pokemon(2, 'Raichu', [new Type(2, 'Electric', new Date())], new Date());

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

    it('should update pokemon with multiple types', async () => {
        // Arrange
        const input = { id: 1, types: ['Fire', 'Flying'] };
        const existingPokemon = new Pokemon(1, 'Charizard', [new Type(1, 'Fire', new Date())], new Date());
        const updatedPokemon = new Pokemon(
            1,
            'Charizard',
            [new Type(1, 'Fire', new Date()), new Type(2, 'Flying', new Date())],
            existingPokemon.createdAt,
        );

        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.update as jest.Mock).mockResolvedValue(updatedPokemon);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(pokemonRepository.update).toHaveBeenCalledWith(expect.any(Pokemon));
        const updated = (pokemonRepository.update as jest.Mock).mock.calls[0][0];
        expect(updated.types).toHaveLength(2);
        expect(updated.types[0].name).toBe('Fire');
        expect(updated.types[1].name).toBe('Flying');
    });

    it('should replace all types when updating', async () => {
        // Arrange
        const input = { id: 1, types: ['Water'] };
        const existingPokemon = new Pokemon(1, 'Charizard', [new Type(1, 'Fire', new Date())], new Date());
        const updatedPokemon = new Pokemon(1, 'Charizard', [new Type(2, 'Water', new Date())], existingPokemon.createdAt);

        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.update as jest.Mock).mockResolvedValue(updatedPokemon);

        // Act
        const result = await useCase.execute(input);

        // Assert
        const updated = (pokemonRepository.update as jest.Mock).mock.calls[0][0];
        expect(updated.types).toHaveLength(1);
        expect(updated.types[0].name).toBe('Water');
        expect(result.types[0].name).toBe('Water');
    });

    it('should update only types without changing name', async () => {
        // Arrange
        const input = { id: 1, types: ['Electric', 'Steel'] };
        const existingPokemon = new Pokemon(1, 'Magnezone', [new Type(1, 'Electric', new Date())], new Date());
        const updatedPokemon = new Pokemon(
            1,
            'Magnezone',
            [new Type(1, 'Electric', new Date()), new Type(2, 'Steel', new Date())],
            existingPokemon.createdAt,
        );

        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.update as jest.Mock).mockResolvedValue(updatedPokemon);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.name).toBe('Magnezone'); // Name unchanged
        expect(result.types).toHaveLength(2);
        expect(result.types[0].name).toBe('Electric');
        expect(result.types[1].name).toBe('Steel');
    });
});
