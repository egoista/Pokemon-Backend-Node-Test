import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PokemonRepositoryPrisma } from '../../../src/infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { Pokemon } from '../../../src/domain/pokemon/pokemon.entity';
import { Type } from '../../../src/domain/type.entity';
import { InMemoryPokemonRepository } from '../../support/pokemon/in-memory-pokemon.repository';

import { createTestApp } from '../../support/create-test-app';

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

    app = await createTestApp(moduleFixture);
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
    const types = ["Psychic"];

    const mutation = `
      mutation {
        createPokemon(input: { id: ${id}, name: "${name}", types: ["${types[0]}"] }) {
          ... on Pokemon {
            id
            name
            types {
                name
            }
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
        expect(data.types).toHaveLength(1);
        expect(data.types[0].name).toBe(types[0]);
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
    const types = ["Electric"];

    // Seed fake DB
    await fakeRepository.save(new Pokemon(999, name, [new Type('Electric', new Date(), 1)]));

    const mutation = `
      mutation {
        createPokemon(input: { id: ${id}, name: "${name}", types: ["${types[0]}"] }) {
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
    await fakeRepository.save(new Pokemon(1, 'Pikachu', [new Type('Electric', new Date('2023-01-01'), 1)], new Date('2023-01-01')));
    await fakeRepository.save(new Pokemon(2, 'Raichu', [new Type('Electric', new Date('2023-01-02'), 2)], new Date('2023-01-02')));
    await fakeRepository.save(new Pokemon(3, 'Bulbasaur', [new Type('Grass', new Date('2023-01-03'), 3)], new Date('2023-01-03')));

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
            types {
                name
            }
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
    await fakeRepository.save(new Pokemon(1, 'Pikachu', [new Type('Electric', new Date('2023-01-01'), 1)], new Date('2023-01-01')));
    await fakeRepository.save(new Pokemon(2, 'Raichu', [new Type('Electric', new Date('2023-01-02'), 2)], new Date('2023-01-02')));
    await fakeRepository.save(new Pokemon(3, 'Bulbasaur', [new Type('Grass', new Date('2023-01-03'), 3)], new Date('2023-01-03')));

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

  it('should create a pokemon with multiple types', async () => {
    // Arrange
    const id = 6;
    const name = "Charizard";
    const types = ["Fire", "Flying"];

    const mutation = `
      mutation {
        createPokemon(input: { id: ${id}, name: "${name}", types: ["${types[0]}", "${types[1]}"] }) {
          ... on Pokemon {
            id
            name
            types {
                name
            }
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
        expect(data.id).toBe(id);
        expect(data.name).toBe(name);
        expect(data.types).toHaveLength(2);
        expect(data.types[0].name).toBe('Fire');
        expect(data.types[1].name).toBe('Flying');
      });
  });

  it('should update pokemon types successfully', async () => {
    // Arrange
    const existingPokemon = new Pokemon(
      1,
      'Pikachu',
      [new Type('Electric', new Date('2023-01-01'), 1)],
      new Date('2023-01-01'),
    );
    await fakeRepository.save(existingPokemon);

    const mutation = `
      mutation {
        updatePokemon(input: { id: 1, types: ["Electric", "Steel"] }) {
          id
          name
          types {
            name
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
        const data = res.body.data.updatePokemon;
        expect(data.id).toBe(1);
        expect(data.name).toBe('Pikachu');
        expect(data.types).toHaveLength(2);
        expect(data.types[0].name).toBe('Electric');
        expect(data.types[1].name).toBe('Steel');
      });
  });

  it('should replace all types when updating', async () => {
    // Arrange
    const existingPokemon = new Pokemon(
      6,
      'Charizard',
      [new Type('Fire', new Date('2023-01-01'), 1), new Type('Flying', new Date('2023-01-01'), 2)],
      new Date('2023-01-01'),
    );
    await fakeRepository.save(existingPokemon);

    const mutation = `
      mutation {
        updatePokemon(input: { id: 6, types: ["Dragon"] }) {
          id
          name
          types {
            name
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
        const data = res.body.data.updatePokemon;
        expect(data.id).toBe(6);
        expect(data.name).toBe('Charizard');
        expect(data.types).toHaveLength(1);
        expect(data.types[0].name).toBe('Dragon');
      });
  });
});
