import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { GraphQLFormattedError } from 'graphql';
import {
  CreatePokemonResultResolver,
  PokemonResolver,
} from '../../infrastructure/pokemon/graphql/pokemon.resolver';
import { PokemonCoreModule } from './pokemon-core.module';

const isTestEnv =
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

@Module({
  imports: [
    PokemonCoreModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      playground: false,
      debug: true,
      includeStacktraceInErrorResponses: false,
      plugins: isTestEnv ? [] : [ApolloServerPluginLandingPageLocalDefault()],
      definitions: isTestEnv
        ? undefined
        : {
            path: join(
              process.cwd(),
              'src/infrastructure/graphql/generated/graphql.ts',
            ),
          },
      context: ({ req, res }) => ({ req, res }),
      // SEC: Sanitize GraphQL errors to avoid leaking internals.
      formatError: (formattedError: GraphQLFormattedError) => ({
        message: formattedError.message,
      }),
    }),
  ],
  providers: [PokemonResolver, CreatePokemonResultResolver],
})
export class PokemonApiGraphqlModule {}
