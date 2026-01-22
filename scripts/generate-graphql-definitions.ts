import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql', './specs/**/*.graphql'],
  path: join(process.cwd(), 'src/infrastructure/graphql/generated/graphql.schema.ts'),
  outputAs: 'class',
});
