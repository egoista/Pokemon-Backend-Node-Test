import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import {
  PokemonAlreadyExistsError,
  PokemonNotFoundError,
  InvalidPokemonIdError,
  InvalidPokemonNameError,
  InvalidPokemonTypeError,
  PokemonNotFoundInExternalApiError,
  ExternalApiTimeoutError,
  ExternalApiError,
} from '../../../domain/pokemon/pokemon.errors';
import { ValidationError } from '../../../application/shared/errors/application.errors';

// ARCH: Map domain errors to GraphQL errors at the boundary.
// ADR-013: Error ownership. ADR-014: GraphQL error mapping via filters.
// SEC: Strip exception metadata before returning to clients.
@Catch(
  PokemonAlreadyExistsError,
  PokemonNotFoundError,
  InvalidPokemonIdError,
  InvalidPokemonNameError,
  InvalidPokemonTypeError,
  PokemonNotFoundInExternalApiError,
  ExternalApiTimeoutError,
  ExternalApiError,
  ValidationError,
)
export class PokemonGraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: Error, _host: ArgumentsHost) {
    void _host;
    if (exception instanceof GraphQLError) {
      return this.fromGraphQLError(exception);
    }
    if (exception instanceof PokemonAlreadyExistsError) {
      return this.buildError(exception.message, {
        code: 'CONFLICT',
        statusCode: 409,
      });
    }

    if (exception instanceof PokemonNotFoundError) {
      return this.buildError(exception.message, {
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    }

    if (
      exception instanceof InvalidPokemonIdError ||
      exception instanceof InvalidPokemonNameError ||
      exception instanceof InvalidPokemonTypeError ||
      exception instanceof ValidationError
    ) {
      return this.buildError(exception.message, {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    if (exception instanceof PokemonNotFoundInExternalApiError) {
      return this.buildError(exception.message, {
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    }

    if (exception instanceof ExternalApiTimeoutError) {
      return this.buildError(exception.message, {
        code: 'GATEWAY_TIMEOUT',
        statusCode: 504,
      });
    }

    if (exception instanceof ExternalApiError) {
      return this.buildError(exception.message, {
        code: 'BAD_GATEWAY',
        statusCode: 502,
      });
    }

    return this.buildError('Internal server error', {
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  }

  private buildError(message: string, extensions: Record<string, unknown>) {
    const sanitizedExtensions = { ...extensions };
    delete (sanitizedExtensions as Record<string, unknown>).exception;
    delete (sanitizedExtensions as Record<string, unknown>).stacktrace;
    const error = new GraphQLError(message, {
      extensions: sanitizedExtensions,
    });
    error.stack = undefined;
    return error;
  }

  private fromGraphQLError(exception: GraphQLError) {
    const sanitizedExtensions = { ...(exception.extensions ?? {}) };
    delete (sanitizedExtensions as Record<string, unknown>).exception;
    delete (sanitizedExtensions as Record<string, unknown>).stacktrace;
    const error = new GraphQLError(exception.message, {
      nodes: exception.nodes,
      source: exception.source,
      positions: exception.positions,
      path: exception.path,
      originalError: exception.originalError,
      extensions: sanitizedExtensions,
    });
    error.stack = undefined;
    return error;
  }
}
