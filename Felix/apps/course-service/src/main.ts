import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  // Prefixo `api` + @Controller('courses') => /api/courses/:id (Traefik encaminha /api/courses/*)
  app.setGlobalPrefix('api', { exclude: ['health'] });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((err) => {
  console.error('[course-service] bootstrap error', err);
  process.exit(1);
});
