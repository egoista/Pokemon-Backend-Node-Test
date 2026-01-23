import { PokemonRepositoryPrisma } from './pokemon.repository.prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { Pokemon } from '../../../domain/pokemon/pokemon.entity';
import { Type } from '../../../domain/type.entity';
import { PokemonListFilters } from '../../../domain/pokemon/pokemon.repository.interface';

describe('PokemonRepositoryPrisma', () => {
    let repository: PokemonRepositoryPrisma;
    let prisma: {
        pokemon: {
            findFirst: jest.Mock;
            create: jest.Mock;
            findUnique: jest.Mock;
            findMany: jest.Mock;
            count: jest.Mock;
            update: jest.Mock;
            upsert: jest.Mock;
            delete: jest.Mock;
        };
        $transaction: jest.Mock;
    };

    beforeEach(() => {
        prisma = {
            pokemon: {
                findFirst: jest.fn(),
                create: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn(),
                update: jest.fn(),
                upsert: jest.fn(),
                delete: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((calls: Promise<unknown>[]) => Promise.all(calls)),
        };

        repository = new PokemonRepositoryPrisma(prisma as unknown as PrismaService);
    });

    it('returns null when findByName does not exist', async () => {
        prisma.pokemon.findFirst.mockResolvedValue(null);

        const result = await repository.findByName('Missing');

        expect(prisma.pokemon.findFirst).toHaveBeenCalledWith({
            where: { name: 'Missing' },
            include: { types: true },
        });
        expect(result).toBeNull();
    });

    it('maps the result from findByName to domain', async () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        prisma.pokemon.findFirst.mockResolvedValue({
            id: 25,
            name: 'Pikachu',
            created_at: createdAt,
            types: [{ id: 1, name: 'Electric', created_at: createdAt }],
        });

        const result = await repository.findByName('Pikachu');

        expect(result).toBeInstanceOf(Pokemon);
        expect(result?.id).toBe(25);
        expect(result?.types[0].name).toBe('Electric');
    });

    it('returns null when findById does not exist', async () => {
        prisma.pokemon.findUnique.mockResolvedValue(null);

        const result = await repository.findById(999);

        expect(prisma.pokemon.findUnique).toHaveBeenCalledWith({
            where: { id: 999 },
            include: { types: true },
        });
        expect(result).toBeNull();
    });

    it('maps results from findAll', async () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        prisma.pokemon.findMany.mockResolvedValue([
            {
                id: 1,
                name: 'Bulbasaur',
                created_at: createdAt,
                types: [{ id: 1, name: 'Grass', created_at: createdAt }],
            },
            {
                id: 2,
                name: 'Ivysaur',
                created_at: createdAt,
                types: [{ id: 1, name: 'Grass', created_at: createdAt }],
            },
        ]);

        const result = await repository.findAll();

        expect(prisma.pokemon.findMany).toHaveBeenCalledWith({
            orderBy: { id: 'asc' },
            include: { types: true },
        });
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Pokemon);
    });

    it('applies filters and pagination in findWithFilters', async () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const filters: PokemonListFilters = {
            type: 'Electric',
            name: 'pika',
            sortBy: 'name',
            sortOrder: 'asc',
            offset: 0,
            limit: 10,
        };

        prisma.pokemon.count.mockResolvedValue(1);
        prisma.pokemon.findMany.mockResolvedValue([
            {
                id: 25,
                name: 'Pikachu',
                created_at: createdAt,
                types: [{ id: 1, name: 'Electric', created_at: createdAt }],
            },
        ]);

        const result = await repository.findWithFilters(filters);

        expect(prisma.pokemon.count).toHaveBeenCalledWith({
            where: {
                types: { some: { name: 'Electric' } },
                name: { contains: 'pika' },
            },
        });
        expect(prisma.pokemon.findMany).toHaveBeenCalledWith({
            where: {
                types: { some: { name: 'Electric' } },
                name: { contains: 'pika' },
            },
            orderBy: { name: 'asc' },
            skip: 0,
            take: 10,
            include: { types: true },
        });
        expect(result.totalCount).toBe(1);
        expect(result.data[0]).toBeInstanceOf(Pokemon);
    });

    it('updates pokemon with reset types', async () => {
        const createdAt = new Date('2024-01-02T00:00:00.000Z');
        const pokemon = new Pokemon(
            7,
            'Squirtle',
            [new Type('Water', createdAt, 1)],
            createdAt,
        );

        prisma.pokemon.update.mockResolvedValue({
            id: 7,
            name: 'Squirtle',
            created_at: createdAt,
            types: [{ id: 1, name: 'Water', created_at: createdAt }],
        });

        const result = await repository.update(pokemon);

        expect(prisma.pokemon.update).toHaveBeenCalledWith({
            where: { id: 7 },
            data: {
                name: 'Squirtle',
                types: {
                    set: [],
                    connectOrCreate: [{ where: { name: 'Water' }, create: { name: 'Water' } }],
                },
            },
            include: { types: true },
        });
        expect(result).toBeInstanceOf(Pokemon);
        expect(result.types[0].name).toBe('Water');
    });

    it('upserts pokemon with update and create payloads', async () => {
        const createdAt = new Date('2024-01-03T00:00:00.000Z');
        const pokemon = new Pokemon(
            4,
            'Charmander',
            [new Type('Fire', createdAt, 2)],
            createdAt,
        );

        prisma.pokemon.upsert.mockResolvedValue({
            id: 4,
            name: 'Charmander',
            created_at: createdAt,
            types: [{ id: 2, name: 'Fire', created_at: createdAt }],
        });

        const result = await repository.upsert(pokemon);

        expect(prisma.pokemon.upsert).toHaveBeenCalledWith({
            where: { id: 4 },
            update: {
                name: 'Charmander',
                types: {
                    set: [],
                    connectOrCreate: [{ where: { name: 'Fire' }, create: { name: 'Fire' } }],
                },
            },
            create: {
                id: 4,
                name: 'Charmander',
                created_at: createdAt,
                types: {
                    connectOrCreate: [{ where: { name: 'Fire' }, create: { name: 'Fire' } }],
                },
            },
            include: { types: true },
        });
        expect(result).toBeInstanceOf(Pokemon);
        expect(result.id).toBe(4);
    });
});
