// Note: TransactionModel class

import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';

/**
 * A class that handles transactions.
 * @remarks - A transaction is a set of changes that are applied to the model at once.
 * - This is useful when multiple changes need to be applied to the model, but the changes should only be written to the file once all changes have been applied.
 * - This is also useful when the changes should be applied to the model, but not written to the file yet.
 * @tutorial - To start a transaction, call the `startTransaction` method.
 * - To apply the changes to the model, call the `finishTransaction` method.
 * - To discard the changes, call the `abortTransaction` method.
 */
export class TransactionModel<T> {
    protected logger: Logging = Global.getInstance().logger;
    private _transactionActive = false;
    protected changes: Partial<T> = {};
    /**
     * A function that writes the changes to the file.
     * @remarks - This function is called when the transaction is finished or without a active transaction immediately.
     * @param update The changes to write.
     */
    protected writeChanges: ((update: T) => Promise<void>) | undefined;

    /**
     * Creates a new instance of the TransactionModel class.
     * @param writeChanges A function that writes the changes to the file.
     * @remarks - If no `writeChanges` function is provided, a transaction is started immediately.
     */
    constructor(writeChanges: ((update: T) => Promise<void>) | undefined) {
        if (writeChanges) {
            this.writeChanges = writeChanges;
        } else {
            this.startTransaction();
        }
    }

    /**
     * Sets the callback function for writing changes to the transaction model.
     * @param writeChanges The callback function that takes an update of type T and returns a Promise that resolves when the changes are written.
     * @remarks - If a transaction is active, the transaction is finished after the callback function is set and the `changes` property is not empty.
     * - Else, if the transaction is active and the `changes` property is empty, the transaction is aborted.
     */
    public setWriteChanges(writeChanges: (update: T) => Promise<void>) {
        this.writeChanges = writeChanges;

        if (
            this.isTransactionActive &&
            !(
                Object.keys(this.changes).length === 0 &&
                this.changes.constructor === Object
            )
        ) {
            this.finishTransaction();
        } else if (this.isTransactionActive) {
            this.abortTransaction();
        }
    }

    /**
     * Calls the `writeChanges` function if it is available.
     * @param update The changes to write.
     * @returns `true` if the `writeChanges` function is available, otherwise `false`.
     * @remarks - If the `writeChanges` function is available, it will be called asynchronously (No waiting for the function to finish).
     */
    protected callWriteChanges(update: T = this.changes as T): boolean {
        if (this.writeChanges) {
            this.writeChanges(update)
                .then(() => {
                    this.logger.debug('Changes written to file');
                })
                .catch((error) => {
                    this.logger.error(
                        'Failed to write changes to file:',
                        error,
                    );
                });

            return true;
        } else {
            this.logger.debug('No writeChanges function available');

            return false;
        }
    }

    /**
     * Starts a transaction
     * @remarks - If a transaction is already active, this method does nothing and logs a warning.
     */
    public startTransaction(): void {
        if (this.isTransactionActive) {
            this.logger.warn('Transaction already active');

            return;
        }
        this._transactionActive = true;
    }

    /**
     * Finishes a transaction
     * @remarks - If no transaction is active, this method does nothing and logs a warning.
     * - This method writes the changes to the file.
     * @remarks - If the `writeChanges` method is not available, this method does nothing.
     */
    public finishTransaction(): void {
        if (!this.isTransactionActive) {
            this.logger.warn('No transaction active');

            return;
        }
        const writeChanges = this.callWriteChanges();
        this.changes = writeChanges ? {} : this.changes;

        this._transactionActive = writeChanges
            ? false
            : this._transactionActive;
    }

    /**
     * Aborts a transaction
     * @remarks - If no transaction is active, this method does nothing and logs a warning.
     * - This method discards all changes.
     */
    public abortTransaction(): void {
        if (!this.isTransactionActive) {
            this.logger.warn('No transaction active');

            return;
        } else if (!this.writeChanges) {
            this.logger.warn('No writeChanges function available');

            return;
        }
        this.changes = {};
        this._transactionActive = false;
    }

    /**
     * Updates the value of the given key.
     * @param key The key to update as path. Example: `data.title`
     * @param value The value to set.
     */
    protected updateKeyValue(key: string, value: unknown): void {
        const keys = key.split('.');
        let current = this.changes as Record<string, unknown>;

        keys.forEach((k, index) => {
            if (index === keys.length - 1) {
                current[k] = value;
            } else {
                current[k] = current[k] || {};
                current = current[k] as Record<string, unknown>;
            }
        });

        if (!this.isTransactionActive) {
            const writeChanges = this.callWriteChanges();
            this.changes = writeChanges ? {} : this.changes;
        }
    }

    /**
     * Returns whether a transaction is active.
     * @returns `true` if a transaction is active, otherwise `false`.
     */
    public get isTransactionActive(): boolean {
        return this._transactionActive;
    }
}
