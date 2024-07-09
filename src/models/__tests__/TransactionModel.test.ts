import MockLogger from 'src/__mocks__/ILogger.mock';
import { TransactionModel } from '../TransactionModel';

describe('TransactionModel', () => {
    class TestTransactionModel<T> extends TransactionModel<T> {
        public testUpdateKeyValue(key: string, value: unknown): void {
            this.updateKeyValue(key, value);
        }
    }

    let writeChangesMock: jest.Mock<
        Promise<void>,
        [unknown, (Promise<void> | undefined)?]
    >;

    beforeEach(() => {
        writeChangesMock = jest.fn().mockResolvedValue(undefined);
    });

    test('should initialize with active transaction if no writeChanges is provided', () => {
        const transactionModel = new TransactionModel(undefined, MockLogger);

        expect(transactionModel.isTransactionActive).toBe(true);
        expect(MockLogger.warn).not.toHaveBeenCalled();
    });

    test('should initialize with inactive transaction if writeChanges is provided', () => {
        const transactionModel = new TransactionModel(
            writeChangesMock,
            MockLogger,
        );

        expect(transactionModel.isTransactionActive).toBe(false);
        expect(MockLogger.warn).not.toHaveBeenCalled();
    });

    test('should start and finish a transaction', async () => {
        const transactionModel = new TransactionModel(
            writeChangesMock,
            MockLogger,
        );

        transactionModel.startTransaction();
        expect(transactionModel.isTransactionActive).toBe(true);

        transactionModel['changes'] = { key: 'value' } as Partial<unknown>;
        transactionModel.finishTransaction();

        expect(transactionModel.isTransactionActive).toBe(false);

        expect(writeChangesMock).toHaveBeenCalledWith(
            { key: 'value' },
            undefined,
        );
    });

    test('should log warning if starting an already active transaction', () => {
        const transactionModel = new TransactionModel(undefined, MockLogger);

        transactionModel.startTransaction();
        transactionModel.startTransaction();

        expect(MockLogger.warn).toHaveBeenCalledWith(
            'Transaction already active',
        );
    });

    test('should log warning if finishing an inactive transaction', () => {
        const transactionModel = new TransactionModel(
            writeChangesMock,
            MockLogger,
        );

        transactionModel.finishTransaction();

        expect(MockLogger.warn).toHaveBeenCalledWith('No transaction active');
    });

    test('should abort a transaction and discard changes', () => {
        const transactionModel = new TransactionModel(
            writeChangesMock,
            MockLogger,
        );

        transactionModel.startTransaction();
        transactionModel['changes'] = { key: 'value' } as Partial<unknown>;

        transactionModel.abortTransaction();

        expect(transactionModel.isTransactionActive).toBe(false);
        expect(transactionModel['changes']).toEqual({});
    });

    test('should log warning if aborting an inactive transaction', () => {
        const transactionModel = new TransactionModel(
            writeChangesMock,
            MockLogger,
        );

        transactionModel.abortTransaction();

        expect(MockLogger.warn).toHaveBeenCalledWith('No transaction active');
    });

    test('should update key value and call writeChanges if no transaction is active', () => {
        const transactionModel = new TestTransactionModel(
            writeChangesMock,
            MockLogger,
        );

        transactionModel.testUpdateKeyValue('data.title', 'new title');

        // expect(transactionModel['changes']).toEqual({
        //     data: { title: 'new title' },
        // });
        expect(writeChangesMock).toHaveBeenCalled();
    });

    test('should update key value and not call writeChanges if transaction is active', () => {
        const transactionModel = new TestTransactionModel(
            writeChangesMock,
            MockLogger,
        );

        transactionModel.startTransaction();
        transactionModel.testUpdateKeyValue('data.title', 'new title');

        expect(transactionModel['changes']).toEqual({
            data: { title: 'new title' },
        });
        expect(writeChangesMock).not.toHaveBeenCalled();
    });

    test('should set writeChanges and finish or abort transaction based on changes existence', () => {
        const transactionModel = new TransactionModel(undefined, MockLogger);

        transactionModel.startTransaction();
        transactionModel['changes'] = { key: 'value' } as Partial<unknown>;

        transactionModel.setWriteChanges(writeChangesMock);

        expect(writeChangesMock).toHaveBeenCalledWith(
            { key: 'value' },
            undefined,
        );
        expect(transactionModel.isTransactionActive).toBe(false);
    });

    test('should set writeChanges and abort transaction if no changes exist', () => {
        const transactionModel = new TransactionModel(undefined, MockLogger);

        transactionModel.startTransaction();

        transactionModel.setWriteChanges(writeChangesMock);

        expect(transactionModel.isTransactionActive).toBe(false);

        expect(MockLogger.warn).toHaveBeenCalledWith(
            'Transaction already active',
        );
    });
});
