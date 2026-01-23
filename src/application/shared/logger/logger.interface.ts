export interface AppLogger {
    info(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}

export class NullLogger implements AppLogger {
    info(): void { }
    error(): void { }
}
