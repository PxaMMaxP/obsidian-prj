export interface ILogger_ {
    getLogger(prefix: string): ILogger;
}

/**
 * Interface for the logger.
 * @remarks You can attach your own logger or `console` as logger.
 */
export interface ILogger {
    /**
     * Log a `trace` message.
     * @param message The trace message to log.
     * @param optionalParams Optional parameters: strings, objects, etc.
     */
    trace(message?: unknown, ...optionalParams: unknown[]): void;

    /**
     * Log an `info` message.
     * @param message The info message to log.
     * @param optionalParams Optional parameters: strings, objects, etc.
     */
    info(message?: unknown, ...optionalParams: unknown[]): void;

    /**
     * Log a `debug` message.
     * @param message The debug message to log.
     * @param optionalParams Optional parameters: strings, objects, etc.
     */
    debug(message?: unknown, ...optionalParams: unknown[]): void;

    /**
     * Log a `warn` message.
     * @param message The warn message to log.
     * @param optionalParams Optional parameters: strings, objects, etc.
     */
    warn(message?: unknown, ...optionalParams: unknown[]): void;

    /**
     * Log an `error` message.
     * @param message The error message to log.
     * @param optionalParams Optional parameters: strings, objects, etc.
     */
    error(message?: unknown, ...optionalParams: unknown[]): void;
}
