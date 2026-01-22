import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePokemonDto {
    @ApiPropertyOptional({ example: 'Raichu', description: 'The name of the Pokemon' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ example: ['Electric'], description: 'The types of the Pokemon' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    types?: string[];
}
