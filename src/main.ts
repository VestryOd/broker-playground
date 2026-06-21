import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { Logger as PinoLogger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  app.enableShutdownHooks();
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
bootstrap();
