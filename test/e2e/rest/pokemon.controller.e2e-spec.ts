import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PokemonRepositoryPrisma } from '../../../src/infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { CreatePokemonDto } from '../../../src/infrastructure/pokemon/dtos/pokemon.dto';
import { Pokemon } from '../../../src/domain/pokemon/pokemon.entity';
import { Type } from '../../../src/domain/type.entity';
import { InMemoryPokemonRepository } from '../../support/pokemon/in-memory-pokemon.repository';
import { createTestApp } from '../../support/create-test-app';

describe('PokemonController (e2e)', () => {
    let app: INestApplication;
    let repo: InMemoryPokemonRepository;

    beforeAll(async () => {
        repo = new InMemoryPokemonRepository();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PokemonRepositoryPrisma)
            .useValue(repo)
            .compile();

        app = await createTestApp(moduleFixture);
    });

    beforeEach(() => {
        repo.clear();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/api/v1/pokemons (POST) - success', async () => {
        const dto: CreatePokemonDto = {
            id: 1,
            name: 'Pikachu',
            types: ['Electric'],
        };

        return request(app.getHttpServer())
            .post('/api/v1/pokemons')
            .send(dto)
            .expect(201)
            .expect((res) => {
                expect(res.body.id).toBe(1);
                expect(res.body.name).toBe('Pikachu');
                expect(res.body.types).toHaveLength(1);
                expect(res.body.types[0].name).toBe('Electric');
            });
    });

    it('/api/v1/pokemons (POST) - 409 Conflict if pokemon already exists', async () => {
        const existingPokemon = new Pokemon(
            1,
            'Pikachu',
            [new Type(1, 'Electric', new Date('2023-01-01'))],
            new Date('2023-01-01'),
        );

        await repo.save(existingPokemon);

        const dto: CreatePokemonDto = {
            id: 1,
            name: 'Pikachu',
            types: ['Electric'],
        };

        return request(app.getHttpServer())
            .post('/api/v1/pokemons')
            .send(dto)
            .expect(409)
            .expect((res) => {
                expect(res.body.statusCode).toBe(409);
                expect(res.body.message).toContain('already exists');
            });
    });

    it('/api/v1/pokemons (POST) - 400 Bad Request if validation logic fails', async () => {
        const dto: CreatePokemonDto = {
            id: -1,
            name: 'Pikachu',
            types: ['Electric'],
        };

        return request(app.getHttpServer())
            .post('/api/v1/pokemons')
            .send(dto)
            .expect(400)
            .expect((res) => {
                expect(res.body.statusCode).toBe(400);
            });
    });

    it('/api/v1/pokemons (GET) - supports filters and pagination', async () => {
        await repo.save(new Pokemon(1, 'Pikachu', [new Type(1, 'Electric', new Date('2023-01-01'))], new Date('2023-01-01')));
        await repo.save(new Pokemon(2, 'Raichu', [new Type(2, 'Electric', new Date('2023-01-02'))], new Date('2023-01-02')));
        await repo.save(new Pokemon(3, 'Bulbasaur', [new Type(3, 'Grass', new Date('2023-01-03'))], new Date('2023-01-03')));

        return request(app.getHttpServer())
            .get('/api/v1/pokemons')
            .query({ type: 'Electric', name: 'chu', page: 1, limit: 1, sortBy: 'name', sortOrder: 'asc' })
            .expect(200)
            .expect((res) => {
                expect(res.body.data).toHaveLength(1);
                expect(res.body.data[0].name).toBe('Pikachu');
                expect(res.body.pagination).toEqual({
                    page: 1,
                    limit: 1,
                    totalCount: 2,
                    totalPages: 2,
                });
            });
    });

    it('/api/v1/pokemons (GET) - supports sort by id desc', async () => {
        await repo.save(new Pokemon(1, 'Pikachu', [new Type(1, 'Electric', new Date('2023-01-01'))], new Date('2023-01-01')));
        await repo.save(new Pokemon(2, 'Raichu', [new Type(2, 'Electric', new Date('2023-01-02'))], new Date('2023-01-02')));
        await repo.save(new Pokemon(3, 'Bulbasaur', [new Type(3, 'Grass', new Date('2023-01-03'))], new Date('2023-01-03')));

        return request(app.getHttpServer())
            .get('/api/v1/pokemons')
            .query({ sortBy: 'id', sortOrder: 'desc' })
            .expect(200)
            .expect((res) => {
                expect(res.body.data).toHaveLength(3);
                expect(res.body.data[0].id).toBe(3);
            });
    });

    it('/api/v1/pokemons (POST) - should create pokemon with multiple types', async () => {
        const dto: CreatePokemonDto = {
            id: 6,
            name: 'Charizard',
            types: ['Fire', 'Flying'],
        };

        return request(app.getHttpServer())
            .post('/api/v1/pokemons')
            .send(dto)
            .expect(201)
            .expect((res) => {
                expect(res.body.id).toBe(6);
                expect(res.body.name).toBe('Charizard');
                expect(res.body.types).toHaveLength(2);
                expect(res.body.types[0].name).toBe('Fire');
                expect(res.body.types[1].name).toBe('Flying');
            });
    });

    it('/api/v1/pokemons/:id (PATCH) - should update pokemon types successfully', async () => {
        const existingPokemon = new Pokemon(
            1,
            'Pikachu',
            [new Type(1, 'Electric', new Date('2023-01-01'))],
            new Date('2023-01-01'),
        );
        await repo.save(existingPokemon);

        const updateDto = {
            types: ['Electric', 'Steel'],
        };

        return request(app.getHttpServer())
            .patch('/api/v1/pokemons/1')
            .send(updateDto)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toBe(1);
                expect(res.body.name).toBe('Pikachu');
                expect(res.body.types).toHaveLength(2);
                expect(res.body.types[0].name).toBe('Electric');
                expect(res.body.types[1].name).toBe('Steel');
            });
    });

    it('/api/v1/pokemons/:id (PATCH) - should replace all types', async () => {
        const existingPokemon = new Pokemon(
            6,
            'Charizard',
            [new Type(1, 'Fire', new Date('2023-01-01')), new Type(2, 'Flying', new Date('2023-01-01'))],
            new Date('2023-01-01'),
        );
        await repo.save(existingPokemon);

        const updateDto = {
            types: ['Dragon'],
        };

        return request(app.getHttpServer())
            .patch('/api/v1/pokemons/6')
            .send(updateDto)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toBe(6);
                expect(res.body.name).toBe('Charizard');
                expect(res.body.types).toHaveLength(1);
                expect(res.body.types[0].name).toBe('Dragon');
            });
    });
});
