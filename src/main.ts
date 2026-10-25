import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // every route starts with /api
  app.use(helmet({ contentSecurityPolicy: false })); // safe headers; CSP off so Swagger UI works
  app.enableCors({ origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',') });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip fields the DTO doesn't declare
      forbidNonWhitelisted: true, // ...and reject the request if any were sent
      transform: true, // turn query strings into numbers etc. as the DTO says
    }),
  );
  app.enableShutdownHooks();

  const docs = new DocumentBuilder()
    .setTitle('BloodHeroes API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, docs)); // http://localhost:4000/docs

  await app.listen(process.env.PORT ?? 4000);
}


bootstrap();