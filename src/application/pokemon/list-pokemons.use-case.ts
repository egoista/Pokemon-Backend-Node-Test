import { Pokemon } from '../../domain/pokemon/pokemon.entity';
import {
    PokemonListFilters,
    PokemonListResult,
    PokemonRepository,
} from '../../domain/pokemon/pokemon.repository.interface';
import { ValidationError } from '../shared/errors/application.errors';
import { normalizeListQuery } from '../shared/query/list-query';

export interface ListPokemonsQuery {
    type?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
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

type PokemonSortField = 'name' | 'id' | 'type' | 'created_at';

export class ListPokemonsUseCase {
    constructor(
        private readonly pokemonRepository: PokemonRepository
    ) { }

    async execute(query: ListPokemonsQuery = {}): Promise<ListPokemonsResult> {
        this.validateInput(query);
        const list = normalizeListQuery<PokemonSortField>(query, {
            defaultSortBy: 'name',
            allowedSortBy: ['name', 'id', 'type', 'created_at'] as const,
            defaultLimit: 20,
            maxLimit: 100,
        });

        const filters: PokemonListFilters = {
            type: query.type,
            name: query.name,
            sortBy: list.sortBy,
            sortOrder: list.sortOrder,
            offset: list.offset,
            limit: list.limit,
        };

        const result: PokemonListResult = await this.pokemonRepository.findWithFilters(filters);
        const totalPages = Math.ceil(result.totalCount / list.limit);

        return {
            data: result.data,
            pagination: {
                page: list.page,
                limit: list.limit,
                totalCount: result.totalCount,
                totalPages,
            },
        };
    }

    private validateInput(query: ListPokemonsQuery): void {
        if (!query) {
            throw new ValidationError('Query is required.');
        }
        if (query.type !== undefined && typeof query.type !== 'string') {
            throw new ValidationError('type must be a string.');
        }
        if (query.name !== undefined && typeof query.name !== 'string') {
            throw new ValidationError('name must be a string.');
        }
    }
}
