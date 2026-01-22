import { IsInt, IsNotEmpty, IsPositive, IsString, IsArray } from 'class-validator';

export class CreatePokemonDto {
    @IsInt()
    @IsPositive()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    types: string[];
}
