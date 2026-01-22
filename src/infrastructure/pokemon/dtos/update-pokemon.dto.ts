import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePokemonDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    type?: string;
}
