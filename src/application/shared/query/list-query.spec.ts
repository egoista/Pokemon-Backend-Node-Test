import { normalizeListQuery } from './list-query';
import { ValidationError } from '../errors/application.errors';

describe('normalizeListQuery', () => {
    const baseOpts = {
        defaultSortBy: 'name' as const,
        allowedSortBy: ['name', 'id'] as const,
    };

    it('uses defaults and computes offset', () => {
        const result = normalizeListQuery({}, {
            ...baseOpts,
            defaultPage: 2,
            defaultLimit: 5,
            defaultSortOrder: 'desc',
            maxLimit: 10,
        });

        expect(result).toEqual({
            page: 2,
            limit: 5,
            offset: 5,
            sortBy: 'name',
            sortOrder: 'desc',
        });
    });

    it('normalizes sortOrder to lowercase', () => {
        const result = normalizeListQuery({ sortOrder: 'ASC' }, baseOpts);

        expect(result.sortOrder).toBe('asc');
    });

    it('throws when limit exceeds maxLimit', () => {
        expect(() => normalizeListQuery({ limit: 11 }, {
            ...baseOpts,
            maxLimit: 10,
        })).toThrow(ValidationError);
    });

    it('throws when sortBy is not allowed', () => {
        expect(() => normalizeListQuery({ sortBy: 'created_at' }, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when sortOrder is invalid', () => {
        expect(() => normalizeListQuery({ sortOrder: 'sideways' }, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when input is missing', () => {
        expect(() => normalizeListQuery(null as unknown as any, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when page is not a number', () => {
        expect(() => normalizeListQuery({ page: '1' as unknown as number }, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when limit is not a number', () => {
        expect(() => normalizeListQuery({ limit: '10' as unknown as number }, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when sortBy is not a string', () => {
        expect(() => normalizeListQuery({ sortBy: 1 as unknown as string }, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when sortOrder is not a string', () => {
        expect(() => normalizeListQuery({ sortOrder: 1 as unknown as string }, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when page is not a positive integer', () => {
        expect(() => normalizeListQuery({ page: 1.5 }, baseOpts))
            .toThrow(ValidationError);
    });

    it('throws when limit is not a positive integer', () => {
        expect(() => normalizeListQuery({ limit: 0 }, baseOpts))
            .toThrow(ValidationError);
    });
});
