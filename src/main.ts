import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './infrastructure/common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Required for proper IP extraction behind proxies (e.g. load balancers, rate limiting)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.setGlobalPrefix('api', {
    exclude: ['graphql', 'health'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, transformOptions: { enableImplicitConversion: true } }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Pokemon API')
    .setDescription('The Pokemon API description')
    .setVersion('1.0')
    .addTag('pokemons')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
