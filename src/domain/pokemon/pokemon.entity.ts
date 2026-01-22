import {
    InvalidPokemonIdError,
    InvalidPokemonNameError,
    InvalidPokemonTypeError,
} from './pokemon.errors';

export class Pokemon {
    private readonly _id: number;
    private _name: string;
    private _type: string;
    private readonly _createdAt: Date;

    constructor(
        id: number,
        name: string,
        type: string,
        createdAt?: Date,
    ) {
        this.validateId(id);
        this.validateName(name);
        this.validateType(type);

        this._id = id;
        this._name = name;
        this._type = type;
        this._createdAt = createdAt ?? new Date();
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get type(): string {
        return this._type;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    set name(value: string) {
        this.validateName(value);
        this._name = value;
    }

    set type(value: string) {
        this.validateType(value);
        this._type = value;
    }

    private validateId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new InvalidPokemonIdError();
        }
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new InvalidPokemonNameError();
        }
    }

    private validateType(type: string): void {
        if (!type || type.trim().length === 0) {
            throw new InvalidPokemonTypeError();
        }
    }
}
