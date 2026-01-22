
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class CreatePokemonInput {
    id: number;
    name: string;
    type: string;
}

export class UpdatePokemonInput {
    id: number;
    name?: Nullable<string>;
    type?: Nullable<string>;
}

export class Pokemon {
    id: number;
    name: string;
    type: string;
    created_at: string;
}

export class PokemonAlreadyExistsError {
    message: string;
}

export class PokemonNotFoundError {
    message: string;
}

export abstract class IQuery {
    abstract pokemons(): Pokemon[] | Promise<Pokemon[]>;

    abstract hello(): string | Promise<string>;
}

export abstract class IMutation {
    abstract createPokemon(input: CreatePokemonInput): CreatePokemonResult | Promise<CreatePokemonResult>;

    abstract updatePokemon(input: UpdatePokemonInput): Pokemon | Promise<Pokemon>;

    abstract deletePokemon(id: number): boolean | Promise<boolean>;
}

export type CreatePokemonResult = Pokemon | PokemonAlreadyExistsError;
type Nullable<T> = T | null;
