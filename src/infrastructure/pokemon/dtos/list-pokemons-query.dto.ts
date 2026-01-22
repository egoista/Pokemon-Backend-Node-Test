import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class ListPokemonsQueryDto {
    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsIn(['name', 'id', 'type', 'created_at'])
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @Max(100)
    limit?: number;
}
