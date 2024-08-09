import { ISettingRow, ISettingRowFluentApi } from './ISettingRow';

/**
 * General error class for {@link ISettingRow}
 */
export class SettingRowError extends Error {
    /**
     * Creates a new instance of {@link SettingRowError}
     * @param message **The error message**
     */
    constructor(message: string) {
        super(message);
        this.name = 'SettingError';
    }
}

/**
 * Error class for instantiation errors in {@link ISettingRow}.
 * @see {@link ISettingRowFluentApi.add}
 */
export class InstantiationError extends SettingRowError {
    /**
     * Creates a new instance of {@link InstantiationError}
     * @param instanceName **The name of the instance**
     * @param error **The error that occurred**
     */
    constructor(instanceName: string, error: Error) {
        super(`Error instantiating ${instanceName}: ${error.message}`);
        this.name = 'InstantiationError';
    }
}

/**
 * Error class for configuration errors in {@link ISettingRow}.
 * @see {@link ISettingRowFluentApi.add}
 */
export class ConfigurationError extends SettingRowError {
    /**
     * Creates a new instance of {@link ConfigurationError}
     * @param instanceName **The name of the instance**
     * @param error **The error that occurred**
     */
    constructor(instanceName: string, error: Error) {
        super(`Error configuring ${instanceName}: ${error.message}`);
        this.name = 'ConfigurationError';
    }
}

/**
 * Error class for errors in the callback functions in {@link ISettingRow}.
 * @see {@link ISettingRowFluentApi.then}
 */
export class CallbackError extends SettingRowError {
    /**
     * Creates a new instance of {@link CallbackError}
     * @param callbackName **The name of the callback**
     * @param error **The error that occurred**
     */
    constructor(callbackName: string, error: Error) {
        super(`Error in ${callbackName} callback: ${error.message}`);
        this.name = 'CallbackError';
    }
}
