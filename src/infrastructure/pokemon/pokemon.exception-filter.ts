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
} from '../../domain/pokemon/pokemon.errors';

@Catch(
    PokemonAlreadyExistsError,
    PokemonNotFoundError,
    InvalidPokemonIdError,
    InvalidPokemonNameError,
    InvalidPokemonTypeError,
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
        } else if (
            error instanceof InvalidPokemonIdError ||
            error instanceof InvalidPokemonNameError ||
            error instanceof InvalidPokemonTypeError
        ) {
            status = HttpStatus.BAD_REQUEST;
            message = error.message;
        }

        response.status(status).json({
            statusCode: status,
            message: message,
            error: error instanceof Error ? error.name : 'UnknownError',
        });
    }
}
