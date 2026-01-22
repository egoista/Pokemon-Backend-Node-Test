import { Module } from '@nestjs/common';
import { PokemonController } from '../../infrastructure/pokemon/controllers/pokemon.controller';
import { PokemonRepositoryPrisma } from '../../infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { GetPokemonByIdUseCase } from '../../application/pokemon/get-pokemon-by-id.use-case';
import { ListPokemonsUseCase } from '../../application/pokemon/list-pokemons.use-case';
import { UpdatePokemonUseCase } from '../../application/pokemon/update-pokemon.use-case';
import { DeletePokemonUseCase } from '../../application/pokemon/delete-pokemon.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PokemonResolver, CreatePokemonResultResolver, PokemonFieldResolver } from '../../infrastructure/pokemon/graphql/pokemon.resolver';

@Module({
    imports: [PrismaModule],
    controllers: [PokemonController],
    providers: [
        PokemonRepositoryPrisma,
        PokemonResolver,
        CreatePokemonResultResolver,
        PokemonFieldResolver,
        {
            provide: CreatePokemonUseCase,
            useFactory: (repo: PokemonRepositoryPrisma) => {
                return new CreatePokemonUseCase(repo);
            },
            inject: [PokemonRepositoryPrisma],
        },
        {
            provide: GetPokemonByIdUseCase,
            useFactory: (repo: PokemonRepositoryPrisma) => {
                return new GetPokemonByIdUseCase(repo);
            },
            inject: [PokemonRepositoryPrisma],
        },
        {
            provide: ListPokemonsUseCase,
            useFactory: (repo: PokemonRepositoryPrisma) => {
                return new ListPokemonsUseCase(repo);
            },
            inject: [PokemonRepositoryPrisma],
        },
        {
            provide: UpdatePokemonUseCase,
            useFactory: (repo: PokemonRepositoryPrisma) => {
                return new UpdatePokemonUseCase(repo);
            },
            inject: [PokemonRepositoryPrisma],
        },
        {
            provide: DeletePokemonUseCase,
            useFactory: (repo: PokemonRepositoryPrisma) => {
                return new DeletePokemonUseCase(repo);
            },
            inject: [PokemonRepositoryPrisma],
        },
    ],
})
export class PokemonModule { }

