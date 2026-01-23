import { PokemonRepositoryTypeORM } from './pokemon.repository.typeorm';
import { Repository } from 'typeorm';
import { PokemonEntity } from '../entities/pokemon.entity.typeorm';
import { TypeEntity } from '../entities/type.entity.typeorm';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { Type } from '../../../domain/type.entity';
import { PokemonListFilters } from '../../../domain/pokemon/pokemon.repository.interface';

describe('PokemonRepositoryTypeORM', () => {
    let repository: PokemonRepositoryTypeORM;
    let mockPokemonRepository: jest.Mocked<Repository<PokemonEntity>>;
    let mockTypeRepository: jest.Mocked<Repository<TypeEntity>>;

    beforeEach(() => {
        mockPokemonRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
        } as any;

        mockTypeRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        } as any;

        repository = new PokemonRepositoryTypeORM(
            mockPokemonRepository,
            mockTypeRepository
        );
    });

    describe('findById', () => {
        it('should find and map a Pokemon by ID with types', async () => {
            const mockEntity: PokemonEntity = {
                id: 1,
                name: 'Pikachu',
                types: [
                    { id: 1, name: 'Electric', created_at: new Date(), pokemons: [] },
                ],
                created_at: new Date(),
            };

            mockPokemonRepository.findOne.mockResolvedValue(mockEntity);

            const result = await repository.findById(1);

            expect(mockPokemonRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['types'],
            });
            expect(result).toBeInstanceOf(Pokemon);
            expect(result?.id).toBe(1);
            expect(result?.name).toBe('Pikachu');
            expect(result?.types).toHaveLength(1);
            expect(result?.types[0].name).toBe('Electric');
        });

        it('should return null when Pokemon not found', async () => {
            mockPokemonRepository.findOne.mockResolvedValue(null);

            const result = await repository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findByName', () => {
        it('should find and map a Pokemon by name with types', async () => {
            const mockEntity: PokemonEntity = {
                id: 25,
                name: 'Pikachu',
                types: [
                    { id: 1, name: 'Electric', created_at: new Date(), pokemons: [] },
                ],
                created_at: new Date(),
            };

            mockPokemonRepository.findOne.mockResolvedValue(mockEntity);

            const result = await repository.findByName('Pikachu');

            expect(mockPokemonRepository.findOne).toHaveBeenCalledWith({
                where: { name: 'Pikachu' },
                relations: ['types'],
            });
            expect(result).toBeInstanceOf(Pokemon);
            expect(result?.name).toBe('Pikachu');
        });

        it('should return null when Pokemon not found', async () => {
            mockPokemonRepository.findOne.mockResolvedValue(null);

            const result = await repository.findByName('NonExistent');

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return all Pokemons ordered by ID', async () => {
            const mockEntities: PokemonEntity[] = [
                {
                    id: 1,
                    name: 'Bulbasaur',
                    types: [{ id: 1, name: 'Grass', created_at: new Date(), pokemons: [] }],
                    created_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Ivysaur',
                    types: [{ id: 1, name: 'Grass', created_at: new Date(), pokemons: [] }],
                    created_at: new Date(),
                },
            ];

            mockPokemonRepository.find.mockResolvedValue(mockEntities);

            const result = await repository.findAll();

            expect(mockPokemonRepository.find).toHaveBeenCalledWith({
                order: { id: 'ASC' },
                relations: ['types'],
            });
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Pokemon);
            expect(result[1]).toBeInstanceOf(Pokemon);
        });
    });

    describe('findWithFilters', () => {
        let mockQueryBuilder: any;

        beforeEach(() => {
            mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn(),
            };

            mockPokemonRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        });

        it('should filter by type', async () => {
            const filters: PokemonListFilters = {
                type: 'Fire',
                sortBy: 'name',
                sortOrder: 'asc',
                offset: 0,
                limit: 10,
            };

            const mockEntities: PokemonEntity[] = [
                {
                    id: 4,
                    name: 'Charmander',
                    types: [{ id: 2, name: 'Fire', created_at: new Date(), pokemons: [] }],
                    created_at: new Date(),
                },
            ];

            mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEntities, 1]);

            const result = await repository.findWithFilters(filters);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('type.name = :type', { type: 'Fire' });
            expect(result.totalCount).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Charmander');
        });

        it('should filter by name (partial match, case-insensitive)', async () => {
            const filters: PokemonListFilters = {
                name: 'pika',
                sortBy: 'name',
                sortOrder: 'asc',
                offset: 0,
                limit: 10,
            };

            const mockEntities: PokemonEntity[] = [
                {
                    id: 25,
                    name: 'Pikachu',
                    types: [{ id: 1, name: 'Electric', created_at: new Date(), pokemons: [] }],
                    created_at: new Date(),
                },
            ];

            mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEntities, 1]);

            const result = await repository.findWithFilters(filters);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(pokemon.name) LIKE :name', {
                name: '%pika%',
            });
            expect(result.data[0].name).toBe('Pikachu');
        });

        it('should apply pagination and sorting', async () => {
            const filters: PokemonListFilters = {
                sortBy: 'id',
                sortOrder: 'desc',
                offset: 10,
                limit: 5,
            };

            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await repository.findWithFilters(filters);

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('pokemon.id', 'DESC');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
        });

        it('should handle empty results', async () => {
            const filters: PokemonListFilters = {
                type: 'NonExistentType',
                sortBy: 'name',
                sortOrder: 'asc',
                offset: 0,
                limit: 10,
            };

            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            const result = await repository.findWithFilters(filters);

            expect(result.totalCount).toBe(0);
            expect(result.data).toHaveLength(0);
        });
    });

    describe('save', () => {
        it('should create a new Pokemon with types', async () => {
            const electricType = new Type('Electric', new Date());
            const pokemon = new Pokemon(25, 'Pikachu', [electricType], new Date());

            const mockTypeEntity: TypeEntity = {
                id: 1,
                name: 'Electric',
                created_at: new Date(),
                pokemons: [],
            };

            const mockSavedEntity: PokemonEntity = {
                id: 25,
                name: 'Pikachu',
                types: [mockTypeEntity],
                created_at: pokemon.createdAt,
            };

            mockTypeRepository.findOne.mockResolvedValue(mockTypeEntity);
            mockPokemonRepository.create.mockReturnValue(mockSavedEntity);
            mockPokemonRepository.save.mockResolvedValue(mockSavedEntity);

            const result = await repository.save(pokemon);

            expect(mockTypeRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Electric' } });
            expect(mockPokemonRepository.save).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Pokemon);
            expect(result.id).toBe(25);
            expect(result.name).toBe('Pikachu');
        });

        it('should resolve and create new types if they do not exist', async () => {
            const newType = new Type('NewType', new Date());
            const pokemon = new Pokemon(1, 'TestMon', [newType], new Date());

            const mockNewTypeEntity: TypeEntity = {
                id: 99,
                name: 'NewType',
                created_at: new Date(),
                pokemons: [],
            };

            const mockSavedEntity: PokemonEntity = {
                id: 1,
                name: 'TestMon',
                types: [mockNewTypeEntity],
                created_at: pokemon.createdAt,
            };

            mockTypeRepository.findOne.mockResolvedValue(null);
            mockTypeRepository.create.mockReturnValue(mockNewTypeEntity);
            mockTypeRepository.save.mockResolvedValue(mockNewTypeEntity);
            mockPokemonRepository.create.mockReturnValue(mockSavedEntity);
            mockPokemonRepository.save.mockResolvedValue(mockSavedEntity);

            const result = await repository.save(pokemon);

            expect(mockTypeRepository.findOne).toHaveBeenCalledWith({ where: { name: 'NewType' } });
            expect(mockTypeRepository.create).toHaveBeenCalledWith({ name: 'NewType' });
            expect(mockTypeRepository.save).toHaveBeenCalled();
            expect(result.types[0].name).toBe('NewType');
        });

        it('should reuse existing types', async () => {
            const existingType = new Type('Fire', new Date());
            const pokemon = new Pokemon(4, 'Charmander', [existingType], new Date());

            const mockTypeEntity: TypeEntity = {
                id: 2,
                name: 'Fire',
                created_at: new Date(),
                pokemons: [],
            };

            const mockSavedEntity: PokemonEntity = {
                id: 4,
                name: 'Charmander',
                types: [mockTypeEntity],
                created_at: pokemon.createdAt,
            };

            mockTypeRepository.findOne.mockResolvedValue(mockTypeEntity);
            mockPokemonRepository.create.mockReturnValue(mockSavedEntity);
            mockPokemonRepository.save.mockResolvedValue(mockSavedEntity);

            await repository.save(pokemon);

            expect(mockTypeRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Fire' } });
            expect(mockTypeRepository.create).not.toHaveBeenCalled();
        });

        it('should handle multiple types correctly', async () => {
            const fireType = new Type('Fire', new Date());
            const flyingType = new Type('Flying', new Date());
            const pokemon = new Pokemon(6, 'Charizard', [fireType, flyingType], new Date());

            const mockFireType: TypeEntity = {
                id: 2,
                name: 'Fire',
                created_at: new Date(),
                pokemons: [],
            };

            const mockFlyingType: TypeEntity = {
                id: 3,
                name: 'Flying',
                created_at: new Date(),
                pokemons: [],
            };

            const mockSavedEntity: PokemonEntity = {
                id: 6,
                name: 'Charizard',
                types: [mockFireType, mockFlyingType],
                created_at: pokemon.createdAt,
            };

            mockTypeRepository.findOne
                .mockResolvedValueOnce(mockFireType)
                .mockResolvedValueOnce(mockFlyingType);
            mockPokemonRepository.create.mockReturnValue(mockSavedEntity);
            mockPokemonRepository.save.mockResolvedValue(mockSavedEntity);

            const result = await repository.save(pokemon);

            expect(mockTypeRepository.findOne).toHaveBeenCalledTimes(2);
            expect(result.types).toHaveLength(2);
            expect(result.types[0].name).toBe('Fire');
            expect(result.types[1].name).toBe('Flying');
        });
    });

    describe('update', () => {
        it('should update Pokemon and its types', async () => {
            const waterType = new Type('Water', new Date());
            const pokemon = new Pokemon(7, 'Squirtle', [waterType], new Date());

            const mockTypeEntity: TypeEntity = {
                id: 4,
                name: 'Water',
                created_at: new Date(),
                pokemons: [],
            };

            const mockUpdatedEntity: PokemonEntity = {
                id: 7,
                name: 'Squirtle',
                types: [mockTypeEntity],
                created_at: pokemon.createdAt,
            };

            mockTypeRepository.findOne.mockResolvedValue(mockTypeEntity);
            mockPokemonRepository.preload.mockResolvedValue(mockUpdatedEntity);
            mockPokemonRepository.save.mockResolvedValue(mockUpdatedEntity);

            const result = await repository.update(pokemon);

            expect(mockPokemonRepository.preload).toHaveBeenCalledWith({
                id: 7,
                name: 'Squirtle',
                types: [mockTypeEntity],
            });
            expect(mockPokemonRepository.save).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Pokemon);
            expect(result.name).toBe('Squirtle');
        });

        it('should fall back to save if preload returns null', async () => {
            const pokemon = new Pokemon(999, 'NewMon', [new Type('Normal', new Date())], new Date());

            const mockTypeEntity: TypeEntity = {
                id: 5,
                name: 'Normal',
                created_at: new Date(),
                pokemons: [],
            };

            const mockSavedEntity: PokemonEntity = {
                id: 999,
                name: 'NewMon',
                types: [mockTypeEntity],
                created_at: pokemon.createdAt,
            };

            mockTypeRepository.findOne.mockResolvedValue(mockTypeEntity);
            mockPokemonRepository.preload.mockResolvedValue(null);
            mockPokemonRepository.create.mockReturnValue(mockSavedEntity);
            mockPokemonRepository.save.mockResolvedValue(mockSavedEntity);

            const result = await repository.update(pokemon);

            expect(mockPokemonRepository.preload).toHaveBeenCalled();
            expect(mockPokemonRepository.create).toHaveBeenCalled();
            expect(result.id).toBe(999);
        });
    });

    describe('upsert', () => {
        it('should delegate to save method', async () => {
            const pokemon = new Pokemon(1, 'Bulbasaur', [new Type('Grass', new Date())], new Date());

            const mockTypeEntity: TypeEntity = {
                id: 1,
                name: 'Grass',
                created_at: new Date(),
                pokemons: [],
            };

            const mockSavedEntity: PokemonEntity = {
                id: 1,
                name: 'Bulbasaur',
                types: [mockTypeEntity],
                created_at: pokemon.createdAt,
            };

            mockTypeRepository.findOne.mockResolvedValue(mockTypeEntity);
            mockPokemonRepository.create.mockReturnValue(mockSavedEntity);
            mockPokemonRepository.save.mockResolvedValue(mockSavedEntity);

            const result = await repository.upsert(pokemon);

            expect(mockPokemonRepository.save).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Pokemon);
        });
    });

    describe('delete', () => {
        it('should delete Pokemon by ID', async () => {
            mockPokemonRepository.delete.mockResolvedValue({ affected: 1, raw: {} } as any);

            await repository.delete(1);

            expect(mockPokemonRepository.delete).toHaveBeenCalledWith({ id: 1 });
        });
    });
});
