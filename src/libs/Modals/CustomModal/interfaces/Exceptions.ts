import { IModal } from './IModal';

/**
 * General error class for {@link IModal}
 */
export class CustomModalError extends Error {
    /**
     * Creates a new instance of {@link CustomModalError}
     * @param message **The error message**
     */
    constructor(message: string) {
        super(message);
        this.name = 'CustomModalError';
    }
}
/**
 * Error class for missing callbacks in {@link IModal}.
 * @see {@link IModal.setOnOpen}
 */
export class MissingCallbackError extends CustomModalError {
    /**
     * Creates a new instance of {@link MissingCallbackError}
     * @param callbackName **The name of the missing callback**
     */
    constructor(callbackName: string) {
        super(`The ${callbackName} callback must be set.`);
        this.name = 'MissingCallbackError';
    }
}

/**
 * Error class for errors in the callback functions in {@link IModal}.
 * @see {@link IModal}
 */
export class CallbackError extends CustomModalError {
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
