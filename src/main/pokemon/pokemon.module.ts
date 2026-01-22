import { Module } from '@nestjs/common';
import { PokemonController } from '../../infrastructure/pokemon/pokemon.controller';
import { PokemonRepositoryPrisma } from '../../infrastructure/pokemon/pokemon.repository.prisma';
import { PrismaModule } from '../../modules/prisma/prisma.module';
import { CreatePokemonUseCase } from '../../application/pokemon/create-pokemon.use-case';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Module({
    imports: [PrismaModule],
    controllers: [PokemonController],
    providers: [
        PokemonRepositoryPrisma,
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
