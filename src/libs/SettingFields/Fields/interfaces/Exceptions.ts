import { ISettingField } from '../../interfaces/ISettingField';

/**
 * General error class for {@link ISettingField}
 */
export class SettingFieldError extends Error {
    /**
     * Creates a new instance of {@link SettingFieldError}
     * @param message **The error message**
     */
    constructor(message: string) {
        super(message);
        this.name = 'SettingError';
    }
}

/**
 * Error class for configuration errors in {@link ISettingField}.
 */
export class ConfigurationError extends SettingFieldError {
    /**
     * Creates a new instance of {@link ConfigurationError}
     * @param configurationName **The name of the instance**
     * @param error **The error that occurred**
     */
    constructor(configurationName: string, error: Error) {
        super(`Error configuring ${configurationName}: ${error.message}`);
        this.name = 'ConfigurationError';
    }
}
