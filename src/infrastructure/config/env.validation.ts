import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provisioning')
    .default('development'),
  PORT: Joi.number().default(4000),
  POKEMON_REPOSITORY: Joi.string().valid('prisma', 'typeorm').default('prisma'),
  POKEAPI_BASE_URL: Joi.string().uri().default('https://pokeapi.co/api/v2'),
  POKEAPI_TIMEOUT: Joi.number().default(3000),
  POKEAPI_ACCEPT: Joi.string().default('application/json'),
  POKEAPI_USER_AGENT: Joi.string().default('Backend-Node-Test/1.0'),
  POKEAPI_RETRY_MAX_ATTEMPTS: Joi.number().integer().min(1).default(2),
  POKEAPI_RETRY_BASE_DELAY_MS: Joi.number().integer().min(0).default(200),
  POKEAPI_RETRY_MAX_DELAY_MS: Joi.number().integer().min(0).default(1000),
  POKEAPI_CB_FAILURE_THRESHOLD: Joi.number().integer().min(1).default(3),
  POKEAPI_CB_OPEN_MS: Joi.number().integer().min(0).default(10000),
  POKEAPI_CACHE_ENABLED: Joi.boolean().default(true),
  POKEAPI_CACHE_TTL_MS: Joi.number().integer().min(0).default(30000),
  CACHE_TTL: Joi.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(60000),
});
