import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { auth } from './modules/auth/auth.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  // bodyParser disabled: Better Auth's handler needs the raw request body,
  // so it's mounted before Nest's global body parser touches /api/auth/*.
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use('/api/auth/*splat', toNodeHandler(auth));
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
