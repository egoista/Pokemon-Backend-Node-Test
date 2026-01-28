import { PokemonHttpExceptionFilter } from './pokemon.exception-filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
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
import { Response } from 'express';

describe('PokemonHttpExceptionFilter', () => {
  let filter: PokemonHttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new PokemonHttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn(),
      }),
      getType: jest.fn(),
    } as unknown as ArgumentsHost;
  });

  it('should catch PokemonAlreadyExistsError and return Conflict', () => {
    const exception = new PokemonAlreadyExistsError('Pikachu');
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: expect.stringContaining('already exists'),
      }),
    );
  });

  it('should catch PokemonNotFoundError and return NotFound', () => {
    const exception = new PokemonNotFoundError(1);
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: expect.stringContaining('not found'),
      }),
    );
  });

  it('should catch InvalidPokemonIdError and return BadRequest', () => {
    const exception = new InvalidPokemonIdError();
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
      }),
    );
  });

  it('should catch InvalidPokemonNameError and return BadRequest', () => {
    const exception = new InvalidPokemonNameError();
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should catch InvalidPokemonTypeError and return BadRequest', () => {
    const exception = new InvalidPokemonTypeError();
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should catch PokemonNotFoundInExternalApiError and return NotFound', () => {
    const exception = new PokemonNotFoundInExternalApiError(999);
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should catch ExternalApiTimeoutError and return GatewayTimeout', () => {
    const exception = new ExternalApiTimeoutError();
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.GATEWAY_TIMEOUT);
  });

  it('should catch ExternalApiRateLimitError and return TooManyRequests', () => {
    const exception = new ExternalApiRateLimitError();
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.TOO_MANY_REQUESTS,
    );
  });

  it('should catch ExternalApiClientError and return BadRequest', () => {
    const exception = new ExternalApiClientError('Bad input');
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should catch ExternalApiUnavailableError and return ServiceUnavailable', () => {
    const exception = new ExternalApiUnavailableError();
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  });

  it('should catch ExternalApiServerError and return BadGateway', () => {
    const exception = new ExternalApiServerError('Upstream down');
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
  });

  it('should catch ExternalApiError and return BadGateway', () => {
    const exception = new ExternalApiError('Upstream error');
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
  });

  it('should catch generic error and return InternalServerError', () => {
    const exception = new Error('Random error');
    filter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('should handle non-error values as UnknownError', () => {
    filter.catch('oops' as unknown as any, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'UnknownError',
      }),
    );
  });
});
