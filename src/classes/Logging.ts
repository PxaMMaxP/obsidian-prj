/* eslint-disable no-console */
import { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Register } from 'ts-injex';
import { ImplementsStatic } from './decorators/ImplementsStatic';

/**
 * Enum representing logging levels as numeric values.
 */
export enum LoggingLevelNumber {
    'none' = 0,
    'trace' = 1,
    'debug' = 2,
    'info' = 3,
    'warn' = 4,
    'error' = 5,
}

/**
 * Representing logging levels as string values.
 */
export type LoggingLevel =
    | 'none'
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error';

/**
 * Logging class; encapsulates console.log, console.debug, console.warn and console.error.
 */
@ImplementsStatic<ILogger_>()
@Register('ILogger_')
export class Logging implements ILogger {
    private static _instance: Logging;
    private _logLevel: LoggingLevelNumber;

    private _logPrefix: string;

    /**
     * Sets the log prefix.
     * @param value The value to set.
     */
    public setLogPrefix(value: string): void {
        this._logPrefix = value ? `${value}-` : '';
    }

    /**
     * Gets the default log level.
     */
    private static get _defaultLogLevel(): LoggingLevelNumber {
        return LoggingLevelNumber.info;
    }

    public trace: (...args: unknown[]) => void;
    public debug: (...args: unknown[]) => void;
    public info: (...args: unknown[]) => void;
    public warn: (...args: unknown[]) => void;
    public error: (...args: unknown[]) => void;

    /**
     * Gets the singleton instance of the Logging class.
     * @param logLevel The log level to use. Defaults to "info".
     * @param logPrefix The prefix to prepend to log messages.
     */
    constructor(logLevel?: LoggingLevel | string | undefined, logPrefix = '') {
        if (Logging._instance) {
            Logging._instance.setLogPrefix(logPrefix);
            Logging._instance.setLogLevel(logLevel);

            return Logging._instance;
        }
        Logging._instance = this;

        this.setLogPrefix(logPrefix);
        this.setLogLevel(logLevel);
    }

    /**
     * Sets the log level and assigns the appropriate logging methods.
     * @param logLevel The log level to set.
     */
    public setLogLevel(logLevel: LoggingLevel | string | undefined): void {
        this._setLogLevel(this.parseLoggingLevel(logLevel));

        if (this._logLevel === LoggingLevelNumber.none) {
            console.info('Logging disabled');
        }
    }

    /**
     * Sets the log level and assigns the appropriate logging methods.
     * @param logLevel The log level to set.
     */
    private _setLogLevel(logLevel: LoggingLevelNumber): void {
        this._logLevel = logLevel;

        this.trace = this._none;
        this.debug = this._none;
        this.info = this._none;
        this.warn = this._none;
        this.error = this._none;

        if (this.logLevelActive(LoggingLevelNumber.trace))
            this.trace = this._trace.bind(this);

        if (this.logLevelActive(LoggingLevelNumber.debug))
            this.debug = this._debug.bind(this);

        if (this.logLevelActive(LoggingLevelNumber.info))
            this.info = this._info.bind(this);

        if (this.logLevelActive(LoggingLevelNumber.warn))
            this.warn = this._warn.bind(this);

        if (this.logLevelActive(LoggingLevelNumber.error))
            this.error = this._error.bind(this);

        console.info(`Log level set to ${LoggingLevelNumber[this._logLevel]}`);
    }

    /**
     * Gets the singleton instance of the Logging class.
     * @returns The Logging singleton instance.
     */
    public static getInstance(): Logging {
        if (!Logging._instance) {
            Logging._instance = new Logging();
        }

        return Logging._instance;
    }

    /**
     * Returns an object with logging methods that prepend a specified prefix to messages.
     * @param prefix The prefix to prepend to all log messages.
     * @returns An object with logging methods.
     */
    public static getLogger(prefix: string): ILogger {
        const instance = Logging.getInstance();
        prefix = `${prefix}: `;

        const logMethods: ILogger = Logging.newLoggerWithPrefix(
            instance,
            prefix,
        );

        return logMethods;
    }

    /**
     * Creates a new logger with a specified prefix.
     * @param instance The Logging instance which will be used to log messages.
     * @param prefix The prefix to prepend to the log message.
     * @returns An object with logging methods.
     */
    private static newLoggerWithPrefix(
        instance: Logging,
        prefix: string,
    ): ILogger {
        return {
            /**
             * Logs a `trace` message
             * @param args The arguments to log
             * @returns Nothing
             */
            trace: (...args: unknown[]): void =>
                instance.trace(prefix, ...args),
            /**
             * Logs a `debug` message
             * @param args The arguments to log
             * @returns Nothing
             */
            debug: (...args: unknown[]): void =>
                instance.debug(prefix, ...args),
            /**
             * Logs an `info` message
             * @param args The arguments to log
             * @returns Nothing
             */
            info: (...args: unknown[]): void => instance.info(prefix, ...args),
            /**
             * Logs a `warn` message
             * @param args The arguments to log
             * @returns Nothing
             */
            warn: (...args: unknown[]): void => instance.warn(prefix, ...args),
            /**
             * Logs an `error` message
             * @param args The arguments to log
             * @returns Nothing
             */
            error: (...args: unknown[]): void =>
                instance.error(prefix, ...args),
        };
    }

    /**
     * A no-operation function used for disabled log levels.
     * @param args The arguments to ignore.
     */
    private _none(...args: unknown[]): void {
        // No operation
    }

    /**
     * Logs a message to the console if the log level is "trace".
     * @param message The message to log.
     * @param optionalParams Optional parameters to log.
     */
    private _trace(message?: unknown, ...optionalParams: unknown[]): void {
        const logMessage = this.constructLogMessage(message);
        console.trace(logMessage, ...optionalParams);
    }

    /**
     * Logs a message to the console if the log level is "debug".
     * @param message The message to log.
     * @param optionalParams Optional parameters to log.
     */
    private _debug(message?: unknown, ...optionalParams: unknown[]): void {
        const logMessage = this.constructLogMessage(message);
        console.debug(logMessage, ...optionalParams);
    }

    /**
     * Logs a message to the console if the log level is "info".
     * @param message The message to log.
     * @param optionalParams Optional parameters to log.
     */
    private _info(message?: unknown, ...optionalParams: unknown[]): void {
        const logMessage = this.constructLogMessage(message);
        console.info(logMessage, ...optionalParams);
    }

    /**
     * Logs a message to the console if the log level is "warn".
     * @param message The message to log.
     * @param optionalParams Optional parameters to log.
     */
    private _warn(message?: unknown, ...optionalParams: unknown[]): void {
        const logMessage = this.constructLogMessage(message);
        console.warn(logMessage, ...optionalParams);
    }

    /**
     * Logs a message to the console if the log level is "error".
     * @param message The message to log.
     * @param optionalParams Optional parameters to log.
     */
    private _error(message?: unknown, ...optionalParams: unknown[]): void {
        const logMessage = this.constructLogMessage(message);
        console.error(logMessage, ...optionalParams);
    }

    /**
     * Constructs a log message with the log prefix.
     * @param message The message to log.
     * @returns The constructed log message.
     */
    private constructLogMessage(message?: unknown): string {
        return `${this._logPrefix}${message}`;
    }

    /**
     * Checks if the log level is active.
     * @param logLevel The log level to check.
     * @returns Whether the log level is active.
     */
    private logLevelActive(logLevel: LoggingLevelNumber): boolean {
        return (
            this._logLevel !== LoggingLevelNumber.none &&
            this._logLevel <= logLevel
        );
    }

    /**
     * Parses a logging level string to a numeric value.
     * @param level The logging level string.
     * @returns The numeric logging level.
     */
    private parseLoggingLevel(level: string | undefined): LoggingLevelNumber {
        switch (level) {
            case 'none':
                return LoggingLevelNumber.none;
            case 'trace':
                return LoggingLevelNumber.trace;
            case 'debug':
                return LoggingLevelNumber.debug;
            case 'info':
                return LoggingLevelNumber.info;
            case 'warn':
                return LoggingLevelNumber.warn;
            case 'error':
                return LoggingLevelNumber.error;
            default:
                return Logging._defaultLogLevel;
        }
    }
}
