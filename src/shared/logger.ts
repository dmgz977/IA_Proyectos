import { ILogger } from '../domain/interfaces/logger.interface';

export class ConsoleLogger implements ILogger {
  info(message: string): void {
    console.log(this.format('INFO ', message));
  }

  error(message: string, error?: Error): void {
    console.error(this.format('ERROR', message));
    if (error?.stack) console.error(error.stack);
  }

  private format(level: string, message: string): string {
    const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return `[${ts}] [${level}] ${message}`;
  }
}
