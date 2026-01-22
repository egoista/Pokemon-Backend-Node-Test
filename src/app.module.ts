import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { HelloModule } from "./hello/hello.module";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PokemonModule } from "./main/pokemon/pokemon.module";

const pokemonRepositoryImpl = process.env.POKEMON_REPOSITORY ?? "prisma";
const useTypeOrm = pokemonRepositoryImpl === "typeorm";

// ARCH: Application composition root; infrastructure is selected at runtime.
// ADR-006: Manual composition root. ADR-004: Multiple ORMs via repository abstraction.
// NOTE: Use a single ORM per process to avoid double connections and duplicated schema sync.
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ["./**/*.graphql"],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      definitions: {
        path: join(process.cwd(), "src/infrastructure/graphql/generated/graphql.ts"),
      },
    }),
    HelloModule,
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
