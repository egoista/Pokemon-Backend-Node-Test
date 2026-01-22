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

  beforeEach(async () => {
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

  afterEach(async () => {
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
});
