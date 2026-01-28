import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  PokemonAlreadyExistsError,
  PokemonNotFoundError,
  InvalidPokemonIdError,
  InvalidPokemonNameError,
  InvalidPokemonTypeError,
  PokemonNotFoundInExternalApiError,
  ExternalApiTimeoutError,
  ExternalApiClientError,
  ExternalApiRateLimitError,
  ExternalApiServerError,
  ExternalApiUnavailableError,
  ExternalApiError,
} from '../../../domain/pokemon/pokemon.errors';
import { ValidationError } from '../../../application/shared/errors/application.errors';

// ARCH: Map domain errors to HTTP responses at the boundary.
// ADR-013: Error ownership. ADR-014: HTTP error mapping via filters.
@Catch(
  PokemonAlreadyExistsError,
  PokemonNotFoundError,
  InvalidPokemonIdError,
  InvalidPokemonNameError,
  InvalidPokemonTypeError,
  PokemonNotFoundInExternalApiError,
  ExternalApiTimeoutError,
  ExternalApiClientError,
  ExternalApiRateLimitError,
  ExternalApiServerError,
  ExternalApiUnavailableError,
  ExternalApiError,
  ValidationError,
)
export class PokemonHttpExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (error instanceof PokemonAlreadyExistsError) {
      status = HttpStatus.CONFLICT;
      message = error.message;
    } else if (error instanceof PokemonNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = error.message;
    } else if (error instanceof PokemonNotFoundInExternalApiError) {
      status = HttpStatus.NOT_FOUND;
      message = error.message;
    } else if (
      error instanceof InvalidPokemonIdError ||
      error instanceof InvalidPokemonNameError ||
      error instanceof InvalidPokemonTypeError ||
      error instanceof ValidationError
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = error.message;
    } else if (error instanceof ExternalApiTimeoutError) {
      status = HttpStatus.GATEWAY_TIMEOUT;
      message = error.message;
    } else if (error instanceof ExternalApiRateLimitError) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = error.message;
    } else if (error instanceof ExternalApiClientError) {
      status = HttpStatus.BAD_REQUEST;
      message = error.message;
    } else if (error instanceof ExternalApiUnavailableError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = error.message;
    } else if (error instanceof ExternalApiServerError) {
      status = HttpStatus.BAD_GATEWAY;
      message = error.message;
    } else if (error instanceof ExternalApiError) {
      status = HttpStatus.BAD_GATEWAY;
      message = error.message;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}
