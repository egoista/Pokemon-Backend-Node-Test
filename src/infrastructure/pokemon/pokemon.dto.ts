import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreatePokemonDto {
    @IsInt()
    @IsPositive()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;
}
