/* eslint-disable @typescript-eslint/no-explicit-any */

import { ILogger, ILogger_ } from 'src/interfaces/ILogger';

/**
 * Logging class; encapsulates console.log, console.debug, console.warn and console.error
 */
export const Logging: ILogger_ = class Logging implements ILogger {
    private static _instance: Logging;
    private _logLevel: LoggingLevel;
    private _logPrefix: string;

    /**
     * Creates a new Logging instance
     * @param logLevel The log level to use. Defaults to "info"
     * @param logPrefix The prefix to prepend to log messages
     */
    constructor(logLevel: LoggingLevel = 'info', logPrefix = '') {
        this._logLevel = logLevel;
        this._logPrefix = logPrefix ? `${logPrefix}-` : '';

        if (this._logLevel === 'none') {
            // eslint-disable-next-line no-console
            console.info('Logging disabled');
        }
        Logging._instance = this;
    }

    /**
     * Sets the log level
     * @param logLevel The log level to set
     */
    public setLogLevel(logLevel: LoggingLevel) {
        this._logLevel = logLevel;
        // eslint-disable-next-line no-console
        console.info(`Log level set to ${logLevel}`);
    }

    /**
     * Returns the Logging instance
     * @returns The Logging instance
     */
    public static getInstance(): Logging {
        if (!Logging._instance) {
            Logging._instance = new Logging();
        }

        return Logging._instance;
    }

    /**
     * Returns an object with logging methods that prepend a specified prefix to messages
     * @param prefix The prefix to prepend to all log messages
     * @returns An object with logging methods
     */
    public static getLogger(prefix: string): ILogger {
        const instance = Logging.getInstance();
        prefix = `${prefix}: `;

        const logMethods: {
            [key in Exclude<LoggingLevel, 'none'>]: (...args: any[]) => void;
        } = {
            /**
             * Logs a `trace` message
             * @param args The arguments to log
             * @returns Nothing
             */
            trace: (...args: any[]) =>
                instance.logWithPrefix('trace', prefix, args),
            /**
             * Logs a `debug` message
             * @param args The arguments to log
             * @returns Nothing
             */
            debug: (...args: any[]) =>
                instance.logWithPrefix('debug', prefix, args),
            /**
             * Logs an `info` message
             * @param args The arguments to log
             * @returns Nothing
             */
            info: (...args: any[]) =>
                instance.logWithPrefix('info', prefix, args),
            /**
             * Logs a `warn` message
             * @param args The arguments to log
             * @returns Nothing
             */
            warn: (...args: any[]) =>
                instance.logWithPrefix('warn', prefix, args),
            /**
             * Logs an `error` message
             * @param args The arguments to log
             * @returns Nothing
             */
            error: (...args: any[]) =>
                instance.logWithPrefix('error', prefix, args),
        };

        return logMethods;
    }

    /**
     * Logs a message with a specified prefix and level.
     * @param level - The logging level.
     * @param prefix - The prefix to add to the log message.
     * @param args - The arguments to be logged.
     */
    private logWithPrefix(
        level: Exclude<LoggingLevel, 'none'>,
        prefix: string,
        args: any[],
    ) {
        args.unshift(prefix);
        (this[level] as (...args: any[]) => void)(...args);
    }

    /**
     * Logs a message to the console if the log level is "trace"
     * @param message The message to log
     * @param optionalParams Optional parameters to log
     */
    public trace(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive('trace')) {
            const logMessage = this.constructLogMessage(message);
            // eslint-disable-next-line no-console
            console.debug(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "debug"
     * @param message The message to log
     * @param optionalParams Optional parameters to log
     */
    public debug(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive('debug')) {
            const logMessage = this.constructLogMessage(message);
            // eslint-disable-next-line no-console
            console.debug(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "info" or "debug"
     * @param message The message to log
     * @param optionalParams Optional parameters to log
     */
    public info(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive('info')) {
            const logMessage = this.constructLogMessage(message);
            // eslint-disable-next-line no-console
            console.info(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "info", "debug" or "warn"
     * @param message The message to log
     * @param optionalParams Optional parameters to log
     */
    public warn(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive('warn')) {
            const logMessage = this.constructLogMessage(message);
            // eslint-disable-next-line no-console
            console.warn(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "info", "debug", "warn" or "error"
     * @param message The message to log
     * @param optionalParams Optional parameters to log
     */
    public error(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive('error')) {
            const logMessage = this.constructLogMessage(message);
            // eslint-disable-next-line no-console
            console.error(logMessage, ...optionalParams);
        }
    }

    /**
     * Constructs a log message with the log prefix
     * @param message The message to log
     * @returns The constructed log message: `${this._logPrefix}${message}`
     */
    private constructLogMessage(message?: any): string {
        return `${this._logPrefix}${message}`;
    }

    /**
     * Checks if the log level is active
     * @param logLevel The log level to check
     * @returns Whether the log level is active
     */
    private logLevelActive(logLevel: LoggingLevel): boolean {
        if (this._logLevel === 'none') {
            return false;
        }

        if (this._logLevel === 'trace') {
            return true;
        }

        if (this._logLevel === 'debug') {
            return logLevel !== 'trace';
        }

        if (this._logLevel === 'info') {
            return logLevel !== 'trace' && logLevel !== 'debug';
        }

        if (this._logLevel === 'warn') {
            return (
                logLevel !== 'trace' &&
                logLevel !== 'debug' &&
                logLevel !== 'info'
            );
        }

        if (this._logLevel === 'error') {
            return (
                logLevel !== 'trace' &&
                logLevel !== 'debug' &&
                logLevel !== 'info' &&
                logLevel !== 'warn'
            );
        }

        return true;
    }
};

export type LoggingLevel =
    | 'none'
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error';
