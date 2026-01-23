import { PokemonGraphQLExceptionFilter } from './pokemon-graphql-exception.filter';
import { ArgumentsHost } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
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
import { GraphQLError } from 'graphql';

describe('PokemonGraphQLExceptionFilter', () => {
    let filter: PokemonGraphQLExceptionFilter;
    let mockArgumentsHost: ArgumentsHost;
    let mockGqlHost: GqlArgumentsHost;

    beforeEach(() => {
        filter = new PokemonGraphQLExceptionFilter();

        mockGqlHost = {
            getContext: jest.fn(),
            getInfo: jest.fn(),
            getArgs: jest.fn(),
        } as unknown as GqlArgumentsHost;

        mockArgumentsHost = {
            switchToHttp: jest.fn(),
            getType: jest.fn().mockReturnValue('graphql'),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
        } as unknown as ArgumentsHost;

        jest.spyOn(GqlArgumentsHost, 'create').mockReturnValue(mockGqlHost);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should catch PokemonAlreadyExistsError and return GraphQLError with CONFLICT', () => {
        const exception = new PokemonAlreadyExistsError('Pikachu');
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toContain('already exists');
        expect(result.extensions?.code).toBe('CONFLICT');
        expect(result.extensions?.statusCode).toBe(409);
    });

    it('should catch PokemonNotFoundError and return GraphQLError with NOT_FOUND', () => {
        const exception = new PokemonNotFoundError(1);
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toContain('not found');
        expect(result.extensions?.code).toBe('NOT_FOUND');
        expect(result.extensions?.statusCode).toBe(404);
    });

    it('should catch InvalidPokemonIdError and return GraphQLError with BAD_REQUEST', () => {
        const exception = new InvalidPokemonIdError();
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toContain('positive integer');
        expect(result.extensions?.code).toBe('BAD_REQUEST');
        expect(result.extensions?.statusCode).toBe(400);
    });

    it('should catch InvalidPokemonNameError and return GraphQLError with BAD_REQUEST', () => {
        const exception = new InvalidPokemonNameError();
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.extensions?.code).toBe('BAD_REQUEST');
        expect(result.extensions?.statusCode).toBe(400);
    });

    it('should catch InvalidPokemonTypeError and return GraphQLError with BAD_REQUEST', () => {
        const exception = new InvalidPokemonTypeError();
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.extensions?.code).toBe('BAD_REQUEST');
        expect(result.extensions?.statusCode).toBe(400);
    });

    it('should catch ValidationError and return GraphQLError with BAD_REQUEST', () => {
        const exception = new ValidationError('Invalid input');
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toBe('Invalid input');
        expect(result.extensions?.code).toBe('BAD_REQUEST');
        expect(result.extensions?.statusCode).toBe(400);
    });

    it('should catch PokemonNotFoundInExternalApiError and return GraphQLError with NOT_FOUND', () => {
        const exception = new PokemonNotFoundInExternalApiError(999);
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toContain('not found in external API');
        expect(result.extensions?.code).toBe('NOT_FOUND');
        expect(result.extensions?.statusCode).toBe(404);
    });

    it('should catch ExternalApiTimeoutError and return GraphQLError with GATEWAY_TIMEOUT', () => {
        const exception = new ExternalApiTimeoutError();
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toContain('timed out');
        expect(result.extensions?.code).toBe('GATEWAY_TIMEOUT');
        expect(result.extensions?.statusCode).toBe(504);
    });

    it('should catch ExternalApiError and return GraphQLError with BAD_GATEWAY', () => {
        const exception = new ExternalApiError('Service unavailable');
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toContain('External API error');
        expect(result.extensions?.code).toBe('BAD_GATEWAY');
        expect(result.extensions?.statusCode).toBe(502);
    });

    it('should catch generic error and return GraphQLError with INTERNAL_SERVER_ERROR', () => {
        const exception = new Error('Random error');
        const result = filter.catch(exception, mockArgumentsHost);

        expect(result).toBeInstanceOf(GraphQLError);
        expect(result.message).toBe('Internal server error');
        expect(result.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
        expect(result.extensions?.statusCode).toBe(500);
    });
});
