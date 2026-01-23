import { Logger } from '@nestjs/common';
import { AppLogger } from '../../../application/shared/logger/logger.interface';

export class NestLoggerAdapter implements AppLogger {
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.log(this.format(message, meta));
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.error(this.format(message, meta));
  }

  private format(message: string, meta: Record<string, unknown>): string {
    return JSON.stringify({ message, ...meta });
  }
}
