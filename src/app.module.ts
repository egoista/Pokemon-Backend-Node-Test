import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PokemonModule } from "./main/pokemon/pokemon.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerExceptionFilter } from "./infrastructure/common/filters/throttler-exception.filter";
import { CacheModule } from "./infrastructure/cache/cache.module";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { GqlThrottlerGuard } from "./infrastructure/common/guards/gql-throttler.guard";
import { HttpCacheInterceptor } from "./infrastructure/common/interceptors/http-cache.interceptor";
import { ConfigModule } from "@nestjs/config";
import { envValidationSchema } from "./infrastructure/config/env.validation";
import { HealthModule } from "./infrastructure/health/health.module";

const pokemonRepositoryImpl = process.env.POKEMON_REPOSITORY ?? "prisma";
const useTypeOrm = pokemonRepositoryImpl === "typeorm";

// ARCH: Application composition root; infrastructure is selected at runtime.
// ADR-006: Manual composition root. ADR-004: Multiple ORMs via repository abstraction.
// NOTE: Use a single ORM per process to avoid double connections and duplicated schema sync.
const isTestEnv = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      cache: true,
    }),
    HealthModule,
    CacheModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000"),
          limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "100"),
        },
      ],
    }),
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
      context: ({ req, res }) => ({ req, res }),
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule { }
