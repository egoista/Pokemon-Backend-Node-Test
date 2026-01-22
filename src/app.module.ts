import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PokemonModule } from "./main/pokemon/pokemon.module";

const pokemonRepositoryImpl = process.env.POKEMON_REPOSITORY ?? "prisma";
const useTypeOrm = pokemonRepositoryImpl === "typeorm";

// ARCH: Application composition root; infrastructure is selected at runtime.
// ADR-006: Manual composition root. ADR-004: Multiple ORMs via repository abstraction.
// NOTE: Use a single ORM per process to avoid double connections and duplicated schema sync.
const isTestEnv = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ["./**/*.graphql"],
      playground: false,
      plugins: isTestEnv ? [] : [ApolloServerPluginLandingPageLocalDefault()],
      definitions: isTestEnv
        ? undefined
        : {
            path: join(process.cwd(), "src/infrastructure/graphql/generated/graphql.ts"),
          },
    }),
    PokemonModule,
    ...(useTypeOrm
      ? [
          TypeOrmModule.forRoot({
            type: "sqlite",
            database: "./database/database_orm.sqlite",
            autoLoadEntities: true,
            synchronize: true,
            migrations: ["../typeorm/migrations/*.ts"],
          }),
        ]
      : [PrismaModule]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
