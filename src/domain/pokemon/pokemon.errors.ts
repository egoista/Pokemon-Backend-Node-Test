export class PokemonAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Pokemon with name ${name} already exists.`);
    this.name = 'PokemonAlreadyExistsError';
  }
}

export class PokemonNotFoundError extends Error {
  constructor(id: number) {
    super(`Pokemon with id ${id} not found.`);
    this.name = 'PokemonNotFoundError';
  }
}

export class InvalidPokemonIdError extends Error {
  constructor() {
    super('Pokemon ID must be a positive integer.');
    this.name = 'InvalidPokemonIdError';
  }
}

export class InvalidPokemonNameError extends Error {
  constructor() {
    super('Pokemon name must not be empty.');
    this.name = 'InvalidPokemonNameError';
  }
}

export class InvalidPokemonTypeError extends Error {
  constructor() {
    super('Pokemon type must not be empty.');
    this.name = 'InvalidPokemonTypeError';
  }
}

export class PokemonNotFoundInExternalApiError extends Error {
  constructor(id: number) {
    super(`Pokemon with id ${id} not found in external API.`);
    this.name = 'PokemonNotFoundInExternalApiError';
  }
}

export class ExternalApiTimeoutError extends Error {
  constructor() {
    super('External API request timed out.');
    this.name = 'ExternalApiTimeoutError';
  }
}

export class ExternalApiClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExternalApiClientError';
  }
}

export class ExternalApiRateLimitError extends Error {
  constructor() {
    super('External API rate limit exceeded.');
    this.name = 'ExternalApiRateLimitError';
  }
}

export class ExternalApiServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExternalApiServerError';
  }
}

export class ExternalApiUnavailableError extends Error {
  constructor() {
    super('External API temporarily unavailable.');
    this.name = 'ExternalApiUnavailableError';
  }
}

export class ExternalApiError extends Error {
  constructor(message: string) {
    super(`External API error: ${message}`);
    this.name = 'ExternalApiError';
  }
}
