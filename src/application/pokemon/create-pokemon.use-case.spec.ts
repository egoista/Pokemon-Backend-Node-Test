import { CreatePokemonUseCase } from './create-pokemon.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import {
    PokemonAlreadyExistsError,
    InvalidPokemonIdError,
    InvalidPokemonNameError,
    InvalidPokemonTypeError,
} from '../../domain/pokemon/pokemon.errors';
import { Type } from '../../domain/type.entity';
import { ValidationError } from '../shared/errors/application.errors';

describe('CreatePokemonUseCase', () => {
    let useCase: CreatePokemonUseCase;
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

        useCase = new CreatePokemonUseCase(pokemonRepository);
    });

    it('should create a pokemon successfully', async () => {
        const input = { id: 1, name: 'Pikachu', types: ['Electric'] };
        const typeEntities = [new Type('Electric', expect.any(Date))];
        const createdPokemon = new Pokemon(1, 'Pikachu', typeEntities);

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.save as jest.Mock).mockResolvedValue(createdPokemon);

        const result = await useCase.execute(input);

        expect(pokemonRepository.findByName).toHaveBeenCalledWith('Pikachu');
        expect(pokemonRepository.save).toHaveBeenCalledWith(expect.any(Pokemon));
        const savedPokemon = (pokemonRepository.save as jest.Mock).mock.calls[0][0];
        expect(savedPokemon.id).toBe(1);
        expect(savedPokemon.name).toBe('Pikachu');
        expect(savedPokemon.types).toHaveLength(1);
        expect(savedPokemon.types[0].name).toBe('Electric');
        expect(result).toEqual(createdPokemon);
    });

    it('should throw PokemonAlreadyExistsError if pokemon exists', async () => {
        const input = { id: 1, name: 'Pikachu', types: ['Electric'] };
        const existingPokemon = new Pokemon(1, 'Pikachu', [new Type('Electric', new Date(), 1)]);

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(existingPokemon);

        await expect(useCase.execute(input)).rejects.toThrow(PokemonAlreadyExistsError);

        expect(pokemonRepository.findByName).toHaveBeenCalledWith('Pikachu');
        expect(pokemonRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when input is missing', async () => {
        await expect(
            useCase.execute(undefined as unknown as any)
        ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when id is not a number', async () => {
        const input = { id: Number('nope'), name: 'Pikachu', types: ['Electric'] };

        await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
        expect(pokemonRepository.findByName).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name is not a string', async () => {
        const input = { id: 1, name: 123 as unknown as string, types: ['Electric'] };

        await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
        expect(pokemonRepository.findByName).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when types is not an array', async () => {
        const input = { id: 1, name: 'Pikachu', types: 'Electric' as unknown as string[] };

        await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
        expect(pokemonRepository.findByName).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when types contains non-string values', async () => {
        const input = { id: 1, name: 'Pikachu', types: ['Electric', 123 as unknown as string] };

        await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
        expect(pokemonRepository.findByName).not.toHaveBeenCalled();
    });

    it('should throw PokemonAlreadyExistsError if id already exists', async () => {
        const input = { id: 25, name: 'Pikachu', types: ['Electric'] };
        const existingPokemon = new Pokemon(25, 'Raichu', [new Type('Electric', new Date(), 1)]);

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);

        await expect(useCase.execute(input)).rejects.toThrow(PokemonAlreadyExistsError);

        expect(pokemonRepository.findById).toHaveBeenCalledWith(25);
    });

    it('should throw error if name is empty', async () => {
        const input = { id: 1, name: '', types: ['Electric'] };

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow(InvalidPokemonNameError);
    });

    it('should throw error if types list is empty', async () => {
        const input = { id: 1, name: 'Pikachu', types: [] };

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow(InvalidPokemonTypeError);
    });

    it('should throw error if id is invalid', async () => {
        const input = { id: -1, name: 'Pikachu', types: ['Electric'] };

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow(InvalidPokemonIdError);
    });

    it('should create a pokemon with multiple types', async () => {
        const input = { id: 6, name: 'Charizard', types: ['Fire', 'Flying'] };
        const typeEntities = [
            new Type('Fire', expect.any(Date)),
            new Type('Flying', expect.any(Date)),
        ];
        const createdPokemon = new Pokemon(6, 'Charizard', typeEntities);

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.save as jest.Mock).mockResolvedValue(createdPokemon);

        const result = await useCase.execute(input);

        expect(pokemonRepository.save).toHaveBeenCalledWith(expect.any(Pokemon));
        const savedPokemon = (pokemonRepository.save as jest.Mock).mock.calls[0][0];
        expect(savedPokemon.types).toHaveLength(2);
        expect(savedPokemon.types[0].name).toBe('Fire');
        expect(savedPokemon.types[1].name).toBe('Flying');
        expect(result).toEqual(createdPokemon);
    });

    it('should create Type entities with correct properties when creating Pokemon', async () => {
        const input = { id: 7, name: 'Squirtle', types: ['Water'] };

        (pokemonRepository.findByName as jest.Mock).mockResolvedValue(null);
        (pokemonRepository.save as jest.Mock).mockImplementation((pokemon) => Promise.resolve(pokemon));

        await useCase.execute(input);

        const savedPokemon = (pokemonRepository.save as jest.Mock).mock.calls[0][0];
        expect(savedPokemon.types).toHaveLength(1);
        expect(savedPokemon.types[0]).toBeInstanceOf(Type);
        expect(savedPokemon.types[0].name).toBe('Water');
        expect(savedPokemon.types[0].createdAt).toBeInstanceOf(Date);
    });
});
