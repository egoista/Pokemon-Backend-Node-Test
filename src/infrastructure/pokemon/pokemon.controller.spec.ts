import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PokemonController } from './pokemon.controller';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { CreatePokemonDto } from './pokemon.dto';
import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import { PokemonRepository } from '../../domain/pokemon/pokemon.repository';

describe('PokemonController (e2e)', () => {
    let app: INestApplication;
    let repo: PokemonRepository;

    beforeEach(async () => {
        const repoMock = {
            findByName: jest.fn(),
            save: jest.fn(),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [PokemonController],
            providers: [
                {
                    provide: CreatePokemonUseCase,
                    useFactory: (r: PokemonRepository) => new CreatePokemonUseCase(r),
                    inject: ['PokemonRepository'],
                },
                {
                    provide: 'PokemonRepository',
                    useValue: repoMock,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        repo = moduleFixture.get<PokemonRepository>('PokemonRepository');
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

        const pokemonEntity = new Pokemon(
            1,
            'Pikachu',
            'Electric',
            new Date('2023-01-01'),
        );

        (repo.findByName as jest.Mock).mockResolvedValue(null);
        (repo.save as jest.Mock).mockResolvedValue(pokemonEntity);

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
        const dto: CreatePokemonDto = {
            id: 1,
            name: 'Pikachu',
            type: 'Electric',
        };

        const existingPokemon = new Pokemon(
            1,
            'Pikachu',
            'Electric',
            new Date('2023-01-01'),
        );

        (repo.findByName as jest.Mock).mockResolvedValue(existingPokemon);

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

        (repo.findByName as jest.Mock).mockResolvedValue(null);

        return request(app.getHttpServer())
            .post('/pokemons')
            .send(dto)
            .expect(400)
            .expect((res) => {
                expect(res.body.statusCode).toBe(400);
            });
    });
});
