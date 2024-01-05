
// Note: TransactionModel class

export class TransactionModel<T> {
    protected transactionActive = false;
    protected changes: Partial<T> = {};
    protected writeChanges: (update: T) => void;

    constructor(writeChanges: (update: T) => void) {
        this.transactionActive = false;
        this.writeChanges = writeChanges;
    }

    public startTransaction(): void {
        this.transactionActive = true;
    }

    public finishTransaction(): void {
        this.writeChanges(this.changes as T);
        this.transactionActive = false;
    }

    public abortTransaction(): void {
        this.changes = {};
        this.transactionActive = false;
    }

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

    private get isTransactionActive(): boolean {
        return this.transactionActive;
    }
}