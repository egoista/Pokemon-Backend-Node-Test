import { IsInt, IsPositive } from 'class-validator';

export class ImportPokemonDto {
    @IsInt()
    @IsPositive()
    id: number;
}
