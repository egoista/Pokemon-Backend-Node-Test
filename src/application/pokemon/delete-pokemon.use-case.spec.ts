import { DeletePokemonUseCase } from './delete-pokemon.use-case';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository.interface';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { Type } from '../../domain/type.entity';
import { PokemonNotFoundError } from '../../domain/pokemon/pokemon.errors';
import { ValidationError } from '../shared/errors/application.errors';

describe('DeletePokemonUseCase', () => {
    let useCase: DeletePokemonUseCase;
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
        useCase = new DeletePokemonUseCase(pokemonRepository);
    });

    it('should delete pokemon when it exists', async () => {
        const pokemonId = 1;
        const existingPokemon = new Pokemon(pokemonId, 'Pikachu', [new Type('Electric', new Date(), 1)], new Date());
        (pokemonRepository.findById as jest.Mock).mockResolvedValue(existingPokemon);
        (pokemonRepository.delete as jest.Mock).mockResolvedValue(undefined);

        await useCase.execute(pokemonId);

        expect(pokemonRepository.findById).toHaveBeenCalledWith(pokemonId);
        expect(pokemonRepository.delete).toHaveBeenCalledWith(pokemonId);
    });

    it('should throw PokemonNotFoundError when pokemon does not exist', async () => {
        const pokemonId = 999;
        (pokemonRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(useCase.execute(pokemonId)).rejects.toThrow(PokemonNotFoundError);
        expect(pokemonRepository.findById).toHaveBeenCalledWith(pokemonId);
        expect(pokemonRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid id', async () => {
        await expect(useCase.execute(0)).rejects.toThrow(ValidationError);
        await expect(useCase.execute(-1)).rejects.toThrow(ValidationError);
        await expect(useCase.execute(1.2)).rejects.toThrow(ValidationError);
        expect(pokemonRepository.findById).not.toHaveBeenCalled();
    });
});
