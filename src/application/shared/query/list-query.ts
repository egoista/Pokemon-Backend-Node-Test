import { ValidationError } from '../errors/application.errors';

export type SortOrder = 'asc' | 'desc';

export type PaginationSpec = {
  page: number;
  limit: number;
  offset: number;
};

export type SortSpec<TField extends string> = {
  sortBy: TField;
  sortOrder: SortOrder;
};

export type ListQuerySpec<TField extends string> = PaginationSpec &
  SortSpec<TField>;

type ListQueryInput = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export function normalizeListQuery<TField extends string>(
  input: ListQueryInput,
  opts: {
    defaultPage?: number;
    defaultLimit?: number;
    maxLimit?: number;
    defaultSortBy: TField;
    allowedSortBy: readonly TField[];
    defaultSortOrder?: SortOrder;
  },
): ListQuerySpec<TField> {
  validateInput(input);
  const page = parsePositiveInt(input.page ?? opts.defaultPage ?? 1, 'page');
  const limit = parsePositiveInt(
    input.limit ?? opts.defaultLimit ?? 20,
    'limit',
  );

  const maxLimit = opts.maxLimit ?? 100;
  if (limit < 1 || limit > maxLimit) {
    throw new ValidationError(`limit must be between 1 and ${maxLimit}.`);
  }

  const sortByRaw = (input.sortBy ?? opts.defaultSortBy) as string;
  if (!opts.allowedSortBy.includes(sortByRaw as TField)) {
    throw new ValidationError(
      `sortBy must be one of: ${opts.allowedSortBy.join(', ')}.`,
    );
  }
  const sortBy = sortByRaw as TField;

  const sortOrderRaw = String(
    input.sortOrder ?? opts.defaultSortOrder ?? 'asc',
  ).toLowerCase();
  if (sortOrderRaw !== 'asc' && sortOrderRaw !== 'desc') {
    throw new ValidationError('sortOrder must be either "asc" or "desc".');
  }
  const sortOrder = sortOrderRaw as SortOrder;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    sortBy,
    sortOrder,
  };
}

function validateInput(input: ListQueryInput): void {
  if (!input) {
    throw new ValidationError('Query is required.');
  }
  if (input.page !== undefined && typeof input.page !== 'number') {
    throw new ValidationError('page must be a number.');
  }
  if (input.limit !== undefined && typeof input.limit !== 'number') {
    throw new ValidationError('limit must be a number.');
  }
  if (input.sortBy !== undefined && typeof input.sortBy !== 'string') {
    throw new ValidationError('sortBy must be a string.');
  }
  if (input.sortOrder !== undefined && typeof input.sortOrder !== 'string') {
    throw new ValidationError('sortOrder must be a string.');
  }
}

function parsePositiveInt(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new ValidationError(`${field} must be a positive integer.`);
  }
  return value;
}
