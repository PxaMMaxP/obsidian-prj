import { ISettingColumn } from '../../interfaces/ISettingColumn';

/**
 * General error class for {@link ISettingColumn}
 */
export class SettingColumnError extends Error {
    /**
     * Creates a new instance of {@link SettingColumnError}
     * @param message **The error message**
     */
    constructor(message: string) {
        super(message);
        this.name = 'SettingError';
    }
}

/**
 * Error class for configuration errors in {@link ISettingColumn}.
 */
export class ConfigurationError extends SettingColumnError {
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
