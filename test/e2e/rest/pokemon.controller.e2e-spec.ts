import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PokemonRepositoryPrisma } from '../../../src/infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { CreatePokemonDto } from '../../../src/infrastructure/pokemon/dtos/pokemon.dto';
import { Pokemon } from '../../../src/domain/pokemon/pokemon.entity';
import { InMemoryPokemonRepository } from '../../support/pokemon/in-memory-pokemon.repository';

describe('PokemonController (e2e)', () => {
    let app: INestApplication;
    let repo: InMemoryPokemonRepository;

    beforeEach(async () => {
        repo = new InMemoryPokemonRepository();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PokemonRepositoryPrisma)
            .useValue(repo)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('/pokemons (POST) - success', async () => {
        const dto: CreatePokemonDto = {
            id: 1,
            name: 'Pikachu',
            type: 'Electric',
        };

        return request(app.getHttpServer())
            .post('/pokemons')
            .send(dto)
            .expect(201)
            .expect((res) => {
                expect(res.body.id).toBe(1);
                expect(res.body.name).toBe('Pikachu');
                expect(res.body.type).toBe('Electric');
            });
    });

    it('/pokemons (POST) - 409 Conflict if pokemon already exists', async () => {
        const existingPokemon = new Pokemon(
            1,
            'Pikachu',
            'Electric',
            new Date('2023-01-01'),
        );

        await repo.save(existingPokemon);

        const dto: CreatePokemonDto = {
            id: 1,
            name: 'Pikachu',
            type: 'Electric',
        };

        return request(app.getHttpServer())
            .post('/pokemons')
            .send(dto)
            .expect(409)
            .expect((res) => {
                expect(res.body.statusCode).toBe(409);
                expect(res.body.message).toContain('already exists');
            });
    });

    it('/pokemons (POST) - 400 Bad Request if validation logic fails', async () => {
        const dto: CreatePokemonDto = {
            id: -1,
            name: 'Pikachu',
            type: 'Electric',
        };

        return request(app.getHttpServer())
            .post('/pokemons')
            .send(dto)
            .expect(400)
            .expect((res) => {
                expect(res.body.statusCode).toBe(400);
            });
    });

    it('/pokemons (GET) - supports filters and pagination', async () => {
        await repo.save(new Pokemon(1, 'Pikachu', 'Electric', new Date('2023-01-01')));
        await repo.save(new Pokemon(2, 'Raichu', 'Electric', new Date('2023-01-02')));
        await repo.save(new Pokemon(3, 'Bulbasaur', 'Grass', new Date('2023-01-03')));

        return request(app.getHttpServer())
            .get('/pokemons')
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

    it('/pokemons (GET) - supports sort by id desc', async () => {
        await repo.save(new Pokemon(1, 'Pikachu', 'Electric', new Date('2023-01-01')));
        await repo.save(new Pokemon(2, 'Raichu', 'Electric', new Date('2023-01-02')));
        await repo.save(new Pokemon(3, 'Bulbasaur', 'Grass', new Date('2023-01-03')));

        return request(app.getHttpServer())
            .get('/pokemons')
            .query({ sortBy: 'id', sortOrder: 'desc' })
            .expect(200)
            .expect((res) => {
                expect(res.body.data).toHaveLength(3);
                expect(res.body.data[0].id).toBe(3);
            });
    });
});
