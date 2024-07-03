/* eslint-disable @typescript-eslint/no-explicit-any */

import { ILogger } from 'src/interfaces/ILogger';

/**
 * Logging class; encapsulates console.log, console.debug, console.warn and console.error
 */
export default class Logging implements ILogger {
    private static _instance: Logging;
    private _logLevel: LoggingLevel;
    private _logPrefix: string;

    /**
     * Creates a new Logging instance
     * @param logLevel The log level to use. Defaults to "info"
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

    public setLogLevel(logLevel: LoggingLevel) {
        this._logLevel = logLevel;
        // eslint-disable-next-line no-console
        console.info(`Log level set to ${logLevel}`);
    }

    /**
     * Returns the Logging instance
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
     */
    public static getLogger(prefix: string): ILogger {
        const instance = Logging.getInstance();
        prefix = `${prefix}: `;

        const logMethods: {
            [key in Exclude<LoggingLevel, 'none'>]: (...args: any[]) => void;
        } = {
            trace: (...args: any[]) =>
                instance.logWithPrefix('trace', prefix, args),
            debug: (...args: any[]) =>
                instance.logWithPrefix('debug', prefix, args),
            info: (...args: any[]) =>
                instance.logWithPrefix('info', prefix, args),
            warn: (...args: any[]) =>
                instance.logWithPrefix('warn', prefix, args),
            error: (...args: any[]) =>
                instance.logWithPrefix('error', prefix, args),
        };

        return logMethods;
    }

    /**
     * Logs a message with a specified prefix and level.
     *
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
     * @param message
     * @param optionalParams
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
     * @param message
     * @param optionalParams
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
     * @param message
     * @param optionalParams
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
     * @param message
     * @param optionalParams
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
     * @param message
     * @param optionalParams
     */
    public error(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive('error')) {
            const logMessage = this.constructLogMessage(message);
            // eslint-disable-next-line no-console
            console.error(logMessage, ...optionalParams);
        }
    }

    private constructLogMessage(message?: any): string {
        return `${this._logPrefix}${message}`;
    }

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
}

export type LoggingLevel =
    | 'none'
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error';
