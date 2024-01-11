/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Logging class; encapsulates console.log, console.debug, console.warn and console.error
 */
export default class Logging {
    private static instance: Logging;
    private logLevel: LoggingLevel;
    private logPrefix: string;

    /**
     * Creates a new Logging instance
     * @param logLevel The log level to use. Defaults to "info"
     */
    constructor(logLevel: LoggingLevel = "info", logPrefix = "") {
        this.logLevel = logLevel;
        this.logPrefix = `${logPrefix}: `;
        if (this.logLevel === "none") {
            console.info("Logging disabled");
        }
        Logging.instance = this;
    }

    /**
     * Returns the Logging instance
     */
    public static getInstance(): Logging {
        if (!Logging.instance) {
            Logging.instance = new Logging();
        }
        return Logging.instance;
    }

    /**
     * Logs a message to the console if the log level is "trace"
     * @param message 
     * @param optionalParams 
     */
    public trace(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive("trace")) {
            const logMessage = this.constructLogMessage(message);
            console.debug(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "debug"
     * @param message 
     * @param optionalParams 
     */
    public debug(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive("debug")) {
            const logMessage = this.constructLogMessage(message);
            console.debug(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "info" or "debug"
     * @param message 
     * @param optionalParams 
     */
    public info(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive("info")) {
            const logMessage = this.constructLogMessage(message);
            console.info(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "info", "debug" or "warn"
     * @param message 
     * @param optionalParams 
     */
    public warn(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive("warn")) {
            const logMessage = this.constructLogMessage(message);
            console.warn(logMessage, ...optionalParams);
        }
    }

    /**
     * Logs a message to the console if the log level is "info", "debug", "warn" or "error"
     * @param message 
     * @param optionalParams 
     */
    public error(message?: any, ...optionalParams: any[]): void {
        if (this.logLevelActive("error")) {
            const logMessage = this.constructLogMessage(message);
            console.error(logMessage, ...optionalParams);
        }
    }

    private constructLogMessage(message?: any): string {
        return `${this.logPrefix}${message}`;
    }

    private logLevelActive(logLevel: LoggingLevel): boolean {
        if (this.logLevel === "none") {
            return false;
        }
        if (this.logLevel === "trace") {
            return true;
        }
        if (this.logLevel === "debug") {
            return logLevel !== "trace";
        }
        if (this.logLevel === "info") {
            return logLevel !== "trace" && logLevel !== "debug";
        }
        if (this.logLevel === "warn") {
            return logLevel !== "trace" && logLevel !== "debug" && logLevel !== "info";
        }
        if (this.logLevel === "error") {
            return logLevel !== "trace" && logLevel !== "debug" && logLevel !== "info" && logLevel !== "warn";
        }
        return true;
    }
}

export type LoggingLevel = "none" | "trace" | "debug" | "info" | "warn" | "error";