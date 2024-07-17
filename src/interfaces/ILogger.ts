import { LoggingLevel } from 'src/classes/Logging';

/**
 * Static interface for {@link ILogger}.
 */
export interface ILogger_ {
    /**
     * Gets the singleton instance of the Logging class.
     */
    new (
        logLevel?: LoggingLevel | string | undefined,
        logPrefix?: string,
    ): ILogger;
    /**
     * Returns an object with logging methods that prepend
     * a specified prefix to messages.
     * @param prefix The prefix to prepend to all log messages.
     */
    getLogger(prefix: string): ILogger;
    /**
     * Gets the singleton instance of the Logging class.
     */
    getInstance(): ILogger;
}

/**
 * Interface for the logger.
 * @see {@link ILogger_}
 * @remarks You can attach your own logger
 * or `console` as logger => `ILogger` is a wrapper for `console`.
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

    /**
     * Sets the log level
     * @param logLevel The log level to set
     */
    setLogLevel?(logLevel: LoggingLevel | string | undefined): void;

    /**
     * Sets the log prefix.
     */
    setLogPrefix?(value: string): void;
}
