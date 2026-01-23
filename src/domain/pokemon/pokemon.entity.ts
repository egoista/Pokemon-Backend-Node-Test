import {
  InvalidPokemonIdError,
  InvalidPokemonNameError,
  InvalidPokemonTypeError,
} from './pokemon.errors';
import { Type } from '../type.entity';

export class Pokemon {
  private readonly _id: number;
  private _name: string;
  private _types: Type[];
  private readonly _createdAt: Date;

  constructor(id: number, name: string, types: Type[], createdAt?: Date) {
    this.validateId(id);
    this.validateName(name);
    this.validateTypes(types);

    this._id = id;
    this._name = name;
    this._types = types;
    this._createdAt = createdAt ?? new Date();
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get types(): Type[] {
    return this._types;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  set name(value: string) {
    this.validateName(value);
    this._name = value;
  }

  set types(value: Type[]) {
    this.validateTypes(value);
    this._types = value;
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

  private validateTypes(types: Type[]): void {
    if (!types || types.length === 0) {
      throw new InvalidPokemonTypeError();
    }
  }
}
