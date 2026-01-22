import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provisioning')
        .default('development'),
    PORT: Joi.number().default(4000),
    POKEMON_REPOSITORY: Joi.string().valid('prisma', 'typeorm').default('prisma'),
    POKEAPI_BASE_URL: Joi.string().uri().default('https://pokeapi.co/api/v2'),
    POKEAPI_TIMEOUT: Joi.number().default(3000),
    CACHE_TTL: Joi.number().default(60000),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(60000),
});
