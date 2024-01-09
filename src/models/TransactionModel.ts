// Note: TransactionModel class

import Global from "src/classes/Global";
import Logging from "src/classes/Logging";

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
    protected transactionActive = false;
    protected changes: Partial<T> = {};
    /**
     * A function that writes the changes to the file.
     * @remarks - This function is called when the transaction is finished or without a active transaction immediately.
     * @param update The changes to write.
     */
    protected writeChanges: (update: T) => void;

    /**
     * Creates a new instance of the TransactionModel class.
     * @param writeChanges A function that writes the changes to the file.
     */
    constructor(writeChanges: (update: T) => void) {
        this.transactionActive = false;
        this.writeChanges = writeChanges;
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
        this.transactionActive = true;
    }

    /**
     * Finishes a transaction
     * @remarks - If no transaction is active, this method does nothing and logs a warning.
     * - This method writes the changes to the file.
     * @remarks - If the `writeChanges` method throws an error, the error is logged and the transaction is aborted.
     */
    public finishTransaction(): void {
        if (!this.isTransactionActive) {
            this.logger.warn('No transaction active');
            return;
        }
        try {
            this.writeChanges(this.changes as T);
        }
        catch (error) {
            this.logger.error("`writeChanges` failed with error:", error);
        }
        finally {
            this.changes = {};
            this.transactionActive = false;
        }
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
        }
        this.changes = {};
        this.transactionActive = false;
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
            this.writeChanges(this.changes as T);
            this.changes = {};
        }
    }

    /**
     * Returns whether a transaction is active.
     * @returns `true` if a transaction is active, otherwise `false`.
     */
    private get isTransactionActive(): boolean {
        return this.transactionActive;
    }
}