import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PokemonRepositoryPrisma } from '../../../src/infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { Pokemon } from '../../../src/domain/pokemon/pokemon.entity';
import { InMemoryPokemonRepository } from '../../support/pokemon/in-memory-pokemon.repository';

describe('PokemonResolver (e2e)', () => {
  let app: INestApplication;
  let fakeRepository: InMemoryPokemonRepository;

  beforeAll(async () => {
    fakeRepository = new InMemoryPokemonRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PokemonRepositoryPrisma)
      .useValue(fakeRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    fakeRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a pokemon', async () => {
    // Arrange
    const id = 101;
    const name = "Mewtwo";
    const type = "Psychic";

    const mutation = `
      mutation {
        createPokemon(input: { id: ${id}, name: "${name}", type: "${type}" }) {
          ... on Pokemon {
            id
            name
            type
          }
          ... on PokemonAlreadyExistsError {
            message
          }
        }
      }
    `;

    // Act & Assert
    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect(200)
      .expect((res) => {
        const data = res.body.data.createPokemon;
        if (!data || data.message) {
          console.error('Unexpected error:', data);
        }
        expect(data.id).toBe(id);
        expect(data.name).toBe(name);
        expect(data.type).toBe(type);
      });

    // Verify persistence in Fake DB
    const persisted = await fakeRepository.findByName(name);
    expect(persisted).toBeDefined();
    expect(persisted!.id).toBe(id);
  });

  it('should return PokemonAlreadyExistsError if pokemon already exists', async () => {
    // Arrange
    const id = 102;
    const name = "Pikachu";
    const type = "Electric";

    // Seed fake DB
    await fakeRepository.save(new Pokemon(999, name, "ExistingType"));

    const mutation = `
      mutation {
        createPokemon(input: { id: ${id}, name: "${name}", type: "${type}" }) {
          ... on Pokemon {
            id
          }
           ... on PokemonAlreadyExistsError {
            message
            __typename
          }
        }
      }
    `;

    // Act & Assert
    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect(200)
      .expect((res) => {
        const data = res.body.data.createPokemon;
        expect(data.__typename).toBe('PokemonAlreadyExistsError');
        expect(data.message).toBeDefined();
      });
  });

  it('should list pokemons with filters and pagination', async () => {
    await fakeRepository.save(new Pokemon(1, 'Pikachu', 'Electric', new Date('2023-01-01')));
    await fakeRepository.save(new Pokemon(2, 'Raichu', 'Electric', new Date('2023-01-02')));
    await fakeRepository.save(new Pokemon(3, 'Bulbasaur', 'Grass', new Date('2023-01-03')));

    const query = `
      query {
        pokemons(
          filter: { type: "Electric", name: "chu" }
          pagination: { page: 1, limit: 1 }
          sort: { sortBy: "name", sortOrder: "asc" }
        ) {
          data {
            id
            name
            type
          }
          pagination {
            page
            limit
            totalCount
            totalPages
          }
        }
      }
    `;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        const data = res.body.data.pokemons;
        expect(data.data).toHaveLength(1);
        expect(data.data[0].name).toBe('Pikachu');
        expect(data.pagination).toEqual({
          page: 1,
          limit: 1,
          totalCount: 2,
          totalPages: 2,
        });
      });
  });

  it('should support sorting by created_at desc', async () => {
    await fakeRepository.save(new Pokemon(1, 'Pikachu', 'Electric', new Date('2023-01-01')));
    await fakeRepository.save(new Pokemon(2, 'Raichu', 'Electric', new Date('2023-01-02')));
    await fakeRepository.save(new Pokemon(3, 'Bulbasaur', 'Grass', new Date('2023-01-03')));

    const query = `
      query {
        pokemons(
          sort: { sortBy: "created_at", sortOrder: "desc" }
        ) {
          data {
            id
            name
          }
        }
      }
    `;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        const data = res.body.data.pokemons;
        expect(data.data[0].id).toBe(3);
      });
  });
});
