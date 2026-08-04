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

  // Must run before the Better Auth handler below — both it and every Nest
  // route need the preflight response, and enableCors() has to attach to the
  // underlying Express instance before other middleware is registered.
  app.enableCors({
    origin: [
      process.env.CLIENT_URL ?? 'http://localhost:3000',
      process.env.ADMIN_URL ?? 'http://localhost:3002',
    ],
    credentials: true,
  });

  app.use('/api/auth/*splat', toNodeHandler(auth));
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
