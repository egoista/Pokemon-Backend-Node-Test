import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePokemonDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the Pokemon',
  })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ example: 'Pikachu', description: 'The name of the Pokemon' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: ['Electric'],
    description: 'The types of the Pokemon',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  types: string[];
}
