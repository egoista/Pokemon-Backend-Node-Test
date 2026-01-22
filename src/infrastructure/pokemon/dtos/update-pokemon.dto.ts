import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UpdatePokemonDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    types?: string[];
}
