import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import {
    PokemonListFilters,
    PokemonListResult,
    PokemonRepository,
} from '../../domain/pokemon/pokemon.repository.interface';
import { ValidationError } from '../../domain/pokemon/pokemon.errors';

export interface ListPokemonsQuery {
    type?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number | string;
    limit?: number | string;
}

export interface ListPokemonsResult {
    data: Pokemon[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
}

export class ListPokemonsUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(query: ListPokemonsQuery = {}): Promise<ListPokemonsResult> {
        const page = this.parsePositiveInt(query.page ?? 1, 'page');
        const limit = this.parsePositiveInt(query.limit ?? 20, 'limit');

        if (limit < 1 || limit > 100) {
            throw new ValidationError('limit must be between 1 and 100.');
        }

        const sortBy = query.sortBy ?? 'name';
        if (sortBy !== 'name') {
            throw new ValidationError('sortBy must be a valid Pokemon field.');
        }

        const sortOrder = (query.sortOrder ?? 'asc').toLowerCase();
        if (sortOrder !== 'asc' && sortOrder !== 'desc') {
            throw new ValidationError('sortOrder must be either "asc" or "desc".');
        }

        const offset = (page - 1) * limit;
        const filters: PokemonListFilters = {
            type: query.type,
            name: query.name,
            sortBy: 'name',
            sortOrder: sortOrder as 'asc' | 'desc',
            offset,
            limit,
        };

        const result: PokemonListResult = await this.pokemonRepository.findWithFilters(filters);
        const totalPages = Math.ceil(result.totalCount / limit);

        return {
            data: result.data,
            pagination: {
                page,
                limit,
                totalCount: result.totalCount,
                totalPages,
            },
        };
    }

    private parsePositiveInt(value: number | string, field: string): number {
        const parsed = typeof value === 'string' ? Number(value) : value;

        if (!Number.isInteger(parsed) || parsed < 1) {
            throw new ValidationError(`${field} must be a positive integer.`);
        }

        return parsed;
    }
}
