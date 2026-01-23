module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  maxWorkers: 1,
  testPathIgnorePatterns: ['/test/e2e/'],
  // NOTE: Exclude TypeORM decorator files and test-only helpers from coverage.
  coveragePathIgnorePatterns: [
    '/src/infrastructure/pokemon/entities/pokemon.entity.typeorm.ts',
    '/src/infrastructure/pokemon/entities/type.entity.typeorm.ts',
    '/test/support/pokemon/in-memory-pokemon.repository.ts',
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
