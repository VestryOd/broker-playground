import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { correlationStorage } from "./correlation.context";

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-request-id'] as string) || String(req.id);
    correlationStorage.run({ correlationId }, next);
  }
}