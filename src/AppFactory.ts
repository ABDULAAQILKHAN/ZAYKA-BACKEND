// Removed manual assignment to global.crypto; Node >= v15 already exposes a read-only Web Crypto API.
// If you need classic Node crypto functions, import from 'node:crypto' where used.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

export class AppFactory {
  static async create() {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    app.enableCors({
      origin: ['http://localhost:3000', 'https://zaykadarbar.vercel.app', 'http://localhost:3001', 'https://zayka-rims.vercel.app'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Zayka API')
      .setDescription('API Docs')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global interceptors
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Global exception filters
    app.useGlobalFilters(new AllExceptionsFilter());

    return { app, expressApp };
  }
}
