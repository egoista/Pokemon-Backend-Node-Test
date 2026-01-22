export class PokemonAlreadyExistsError extends Error {
    constructor(name: string) {
        super(`Pokemon with name ${name} already exists.`);
        this.name = 'PokemonAlreadyExistsError';
    }
}

export class PokemonNotFoundError extends Error {
    constructor(id: number) {
        super(`Pokemon with id ${id} not found.`);
        this.name = 'PokemonNotFoundError';
    }
}

export class InvalidPokemonIdError extends Error {
    constructor() {
        super('Pokemon ID must be a positive integer.');
        this.name = 'InvalidPokemonIdError';
    }
}

export class InvalidPokemonNameError extends Error {
    constructor() {
        super('Pokemon name must not be empty.');
        this.name = 'InvalidPokemonNameError';
    }
}

export class InvalidPokemonTypeError extends Error {
    constructor() {
        super('Pokemon type must not be empty.');
        this.name = 'InvalidPokemonTypeError';
    }
}


