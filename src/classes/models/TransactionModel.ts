
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
        if (!this.isTransactionActive) {
            this.writeChanges({ [key]: value } as T);
        } else {
            (this.changes as Record<string, unknown>)[key] = value;
        }
    }

    private get isTransactionActive(): boolean {
        return this.transactionActive;
    }
}