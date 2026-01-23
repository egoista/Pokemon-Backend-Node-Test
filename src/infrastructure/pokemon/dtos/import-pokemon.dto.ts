import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportPokemonDto {
  @ApiProperty({ example: 25, description: 'The ID of the Pokemon in PokeAPI' })
  @IsInt()
  @IsPositive()
  id: number;
}
