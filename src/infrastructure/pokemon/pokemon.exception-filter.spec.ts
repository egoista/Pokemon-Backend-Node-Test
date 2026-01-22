import { PokemonHttpExceptionFilter } from './pokemon.exception-filter';
import { ArgumentsHost, HttpStatus, BadRequestException } from '@nestjs/common';
import {
    PokemonAlreadyExistsError,
    PokemonNotFoundError,
    InvalidPokemonIdError,
    InvalidPokemonNameError,
    InvalidPokemonTypeError,
} from '../../domain/pokemon/pokemon.errors';
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

    it('should catch generic error and return InternalServerError', () => {
        const exception = new Error('Random error');
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            }),
        );
    });
});
