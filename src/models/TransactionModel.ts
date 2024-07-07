import BaseComplexDataType from 'src/classes/BaseComplexDataType';
import { ILogger } from 'src/interfaces/ILogger';

/**
 * The type of return value of the `callWriteChanges` method.
 */
type WriteChangesReturnType = {
    /**
     * A promise that resolves when the changes are written to the file.
     */
    promise: Promise<void> | undefined;
    /**
     * A boolean that indicates whether the writeChanges function was called.
     */
    writeTriggered: boolean;
};

/**
 * A class that handles transactions.
 * @remarks - A transaction is a set of changes that are applied to the model at once.
 * - This is useful when multiple changes need to be applied to the model, but the changes should only be written to the file once all changes have been applied.
 * - This is also useful when the changes should be applied to the model, but not written to the file yet.
 * @summary - To start a transaction, call the `startTransaction` method.
 * - To apply the changes to the model, call the `finishTransaction` method.
 * - To discard the changes, call the `abortTransaction` method.
 */
export class TransactionModel<T> {
    protected logger: ILogger | undefined;
    /**
     * A promise that resolves when the changes are written to the file.
     */
    private _writeChangesPromise: Promise<void> | undefined;
    /**
     * Returns the promise that resolves when the last changes are written to the file.
     * @returns Returns the promise if it exists, otherwise `undefined`. The promise can already be solved or pending.
     */
    protected get writeChangesPromise(): Promise<void> | undefined {
        return this._writeChangesPromise;
    }
    private _transactionActive = false;
    protected changes: Partial<T> = {};
    /**
     * A function that writes the changes to the file.
     * @remarks - This function is called when the transaction is finished or without a active transaction immediately.
     * @param update The changes to write.
     * @param previousPromise A promise that resolves when the previous changes are written to the file.
     */
    protected writeChanges:
        | ((update: T, previousPromise?: Promise<void>) => Promise<void>)
        | undefined;

    /**
     * Returns whether a transaction is active.
     * @returns `true` if a transaction is active, otherwise `false`.
     */
    public get isTransactionActive(): boolean {
        return this._transactionActive;
    }

    /**
     * Returns whether changes exist.
     * @returns `true` if changes exist, otherwise `false`.
     */
    private get changesExisting(): boolean {
        return !(
            Object.keys(this.changes).length === 0 &&
            this.changes.constructor === Object
        );
    }

    /**
     * Creates a new instance of the TransactionModel class.
     * @param writeChanges A function that writes the changes to the file.
     * @param logger A optional logger that logs messages.
     * @remarks - If no `writeChanges` function is provided, a transaction is started immediately.
     */
    constructor(
        writeChanges:
            | ((update: T, previousPromise?: Promise<void>) => Promise<void>)
            | undefined,
        logger?: ILogger,
    ) {
        this.logger = logger;

        // Bind the updateKeyValue method to the instance; its required for the ProxyHandler Delegate.
        this.updateKeyValue = this.updateKeyValue.bind(this);

        if (writeChanges) {
            this.writeChanges = writeChanges;
        } else {
            this.startTransaction();
        }
    }

    /**
     * Sets the callback function for writing changes to the transaction model.
     * @param writeChanges The callback function that takes an update of type T and returns a Promise that resolves when the changes are written.
     * @remarks - If a transaction is active, and changes exist, the transaction is finished, else it is aborted.
     */
    public setWriteChanges(
        writeChanges: (
            update: T,
            previousPromise?: Promise<void>,
        ) => Promise<void>,
    ) {
        this.writeChanges = writeChanges;

        if (this.isTransactionActive) {
            if (this.changesExisting) {
                this.finishTransaction();
            } else {
                this.abortTransaction();
            }
        }
    }

    /**
     * Calls the `writeChanges` function if it is available.
     * @param update The changes to write. Defaults to `this.changes` if not provided.
     * @returns An object with a promise that resolves when the changes are written to the file and a boolean that indicates whether the writeChanges function was called.
     * @remarks - If the `writeChanges` function is available, it will be called asynchronously (No waiting for the function to finish).
     * - If the `writeChanges` function is not available, this method does nothing.
     * @remarks - If the `writeChanges` function is called, the `changes` property is set to an empty object after the function is called
     * and the `_writeChangesPromise` property is set to the promise that resolves when the changes are written to the file.
     * - If the `writeChanges` function is not called, the `changes` property is not changed and the `_writeChangesPromise` property is set to itself or `undefined`.
     */
    private callWriteChanges(
        update: T = this.changes as T,
    ): WriteChangesReturnType {
        const writeChanges: WriteChangesReturnType = {
            promise: undefined,
            writeTriggered: false,
        };

        if (this.writeChanges) {
            const promise = this.writeChanges(
                update,
                this._writeChangesPromise,
            );

            promise
                .then(() => {
                    this.logger?.debug('Changes written to file');
                })
                .catch((error) => {
                    this.logger?.error(
                        'Failed to write changes to file:',
                        error,
                    );
                });

            writeChanges.promise = promise;
            writeChanges.writeTriggered = true;
        } else {
            this.logger?.debug('No `writeChanges` function available');
        }

        // Reset changes if writeChanges was called
        this.changes = writeChanges.writeTriggered ? {} : this.changes;

        // Set the promise if writeChanges was called and the promise is available.
        this._writeChangesPromise = writeChanges.promise
            ? writeChanges.promise
            : undefined;

        return writeChanges;
    }

    /**
     * Starts a transaction
     * @remarks - If a transaction is already active, this method does nothing and logs a warning.
     */
    public startTransaction(): void {
        if (this.isTransactionActive) {
            this.logger?.warn('Transaction already active');

            return;
        }
        this._transactionActive = true;
    }

    /**
     * Finishes a transaction
     * @remarks - If no transaction is active, this method does nothing and logs a warning.
     * - This method writes the changes to the file.
     * @remarks - If the `writeChanges` method is not available, this method does nothing. The available changes are not discarded!
     */
    public finishTransaction(): void {
        if (!this.isTransactionActive) {
            this.logger?.warn('No transaction active');

            return;
        }
        const writeChanges = this.callWriteChanges();

        this._transactionActive = writeChanges.writeTriggered
            ? false
            : this._transactionActive;
    }

    /**
     * Aborts a transaction and discards all changes.
     * @remarks - If no transaction is active, this method does nothing and logs a warning.
     * - This method discards all changes!
     */
    public abortTransaction(): void {
        if (!this.isTransactionActive) {
            this.logger?.warn('No transaction active');

            return;
        } else if (!this.writeChanges) {
            this.logger?.warn('No `writeChanges` function available');

            return;
        }
        this.changes = {};
        this._transactionActive = false;
    }

    /**
     * Updates the value of the given key.
     * @param key The key to update as path with dots as separator. Example: `data.title`.
     * @param value The value to set.
     * @remarks If no transaction is active, the changes are written to the file immediately!
     */
    protected updateKeyValue(key: string, value: unknown): void {
        const keys = key.split('.');
        let current = this.changes as Record<string, unknown>;

        keys.forEach((k, index) => {
            if (index === keys.length - 1) {
                // Check if the value is a custom complex data type and get the frontmatter object if it is
                if (value instanceof BaseComplexDataType) {
                    current[k] = (
                        value as BaseComplexDataType
                    ).getFrontmatterObject();
                } else {
                    current[k] = value;
                }
            } else {
                current[k] = current[k] || {};
                current = current[k] as Record<string, unknown>;
            }
        });

        if (!this.isTransactionActive) {
            this.callWriteChanges();
        }
    }
}
