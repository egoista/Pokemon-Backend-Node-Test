import { Module } from '@nestjs/common';
import { PokemonController } from '../../infrastructure/pokemon/controllers/pokemon.controller';
import { PokemonRepositoryPrisma } from '../../infrastructure/pokemon/repositories/pokemon.repository.prisma';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PokemonResolver, CreatePokemonResultResolver } from '../../infrastructure/pokemon/graphql/pokemon.resolver';

@Module({
    imports: [PrismaModule],
    controllers: [PokemonController],
    providers: [
        PokemonRepositoryPrisma,
        PokemonResolver,
        CreatePokemonResultResolver,
        {
            provide: CreatePokemonUseCase,
            useFactory: (repo: PokemonRepositoryPrisma) => {
                return new CreatePokemonUseCase(repo);
            },
            inject: [PokemonRepositoryPrisma],
        },
    ],
})
export class PokemonModule { }
