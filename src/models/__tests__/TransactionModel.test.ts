/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from 'src/interfaces/ILogger';
import { TransactionModel } from '../TransactionModel';

// Mocking the ILogger interface
const mockLogger: ILogger = {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    trace: jest.fn(),
    info: jest.fn(),
};

describe('TransactionModel', () => {
    let mockWriteChanges: jest.Mock;
    let transactionModel: TransactionModel<any>;

    beforeEach(() => {
        mockWriteChanges = jest.fn().mockResolvedValue(undefined);

        transactionModel = new TransactionModel(mockWriteChanges, mockLogger);
    });

    // Test initialization
    describe('Initialization', () => {
        it('should initialize the logger when instantiated', () => {
            expect(transactionModel['logger']).toBe(mockLogger);
        });

        it('should initialize writeChanges when provided in the constructor', () => {
            expect(transactionModel['writeChanges']).toBe(mockWriteChanges);
        });

        it('should start a transaction if writeChanges is not provided', () => {
            const transactionModelWithoutWrite = new TransactionModel(
                undefined,
                mockLogger,
            );
            expect(transactionModelWithoutWrite.isTransactionActive).toBe(true);
        });
    });

    // Test transaction methods
    describe('Transaction methods', () => {
        it('should start a transaction', () => {
            transactionModel.startTransaction();
            expect(transactionModel.isTransactionActive).toBe(true);
        });

        it('should warn if trying to start an already active transaction', () => {
            transactionModel.startTransaction();
            transactionModel.startTransaction();

            expect(mockLogger.warn).toHaveBeenCalledWith(
                'Transaction already active',
            );
        });

        it('should finish a transaction', () => {
            transactionModel.startTransaction();
            transactionModel.finishTransaction();
            expect(transactionModel.isTransactionActive).toBe(false);
        });

        it('should warn if trying to finish a non-active transaction', () => {
            transactionModel.finishTransaction();

            expect(mockLogger.warn).toHaveBeenCalledWith(
                'No transaction active',
            );
        });

        it('should call writeChanges when finishing a transaction', async () => {
            transactionModel.startTransaction();
            transactionModel.finishTransaction();
            await transactionModel['writeChangesPromise'];
            expect(mockWriteChanges).toHaveBeenCalled();
        });

        it('should abort a transaction and discard changes', () => {
            transactionModel.startTransaction();
            transactionModel['changes'] = { key: 'value' };
            transactionModel.abortTransaction();
            expect(transactionModel.isTransactionActive).toBe(false);
            expect(transactionModel['changes']).toEqual({});
        });

        it('should warn if trying to abort a non-active transaction', () => {
            transactionModel.abortTransaction();

            expect(mockLogger.warn).toHaveBeenCalledWith(
                'No transaction active',
            );
        });
    });

    // Test updateKeyValue method
    describe('updateKeyValue', () => {
        it('should update key value when no transaction is active', async () => {
            // @ts-ignore: Accessing protected method for testing purposes
            transactionModel.updateKeyValue('data.title', 'new title');

            // The changes should be empty because they have been written immediately
            expect(transactionModel['changes']).toEqual({});

            await transactionModel['writeChangesPromise'];

            expect(mockWriteChanges).toHaveBeenCalledWith(
                { data: { title: 'new title' } },
                undefined,
            );
        });

        it('should update key value when a transaction is active', () => {
            transactionModel.startTransaction();
            // @ts-ignore: Accessing protected method for testing purposes
            transactionModel.updateKeyValue('data.title', 'new title');
            const changes = transactionModel['changes'];
            expect(changes.data).toBeDefined();
            expect(changes.data.title).toBe('new title');
            expect(mockWriteChanges).not.toHaveBeenCalled();
        });
    });

    // Test callWriteChanges method
    describe('callWriteChanges', () => {
        it('should call writeChanges if available', async () => {
            const update = { key: 'value' };
            // @ts-ignore: Accessing private method for testing purposes
            const result = transactionModel.callWriteChanges(update);
            await result.promise;
            expect(result.writeTriggered).toBe(true);
            expect(mockWriteChanges).toHaveBeenCalledWith(update, undefined);
        });

        it('should not call writeChanges if not available', () => {
            const transactionModelWithoutWrite = new TransactionModel(
                undefined,
                mockLogger,
            );
            // @ts-ignore: Accessing private method for testing purposes
            const result = transactionModelWithoutWrite['callWriteChanges']();
            expect(result.writeTriggered).toBe(false);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                'No `writeChanges` function available',
            );
        });

        it('should reset changes if writeChanges was called', async () => {
            transactionModel['changes'] = { key: 'value' };
            // @ts-ignore: Accessing private method for testing purposes
            const result = transactionModel.callWriteChanges();
            await result.promise;
            expect(transactionModel['changes']).toEqual({});
        });

        it('should not reset changes if writeChanges was not called', () => {
            const transactionModelWithoutWrite = new TransactionModel(
                undefined,
                mockLogger,
            );
            transactionModelWithoutWrite['changes'] = { key: 'value' };
            // @ts-ignore: Accessing private method for testing purposes
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const result = transactionModelWithoutWrite.callWriteChanges();

            expect(transactionModelWithoutWrite['changes']).toEqual({
                key: 'value',
            });
        });

        it('should handle writeChanges rejection gracefully', async () => {
            const errorWriteChanges = jest
                .fn()
                .mockRejectedValue(new Error('Write failed'));

            transactionModel = new TransactionModel(
                errorWriteChanges,
                mockLogger,
            );

            // @ts-ignore: Accessing private method for testing purposes
            const result = transactionModel.callWriteChanges();
            await expect(result.promise).rejects.toThrow('Write failed');

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Failed to write changes to file:',
                new Error('Write failed'),
            );
        });
    });

    // Test setWriteChanges method
    describe('setWriteChanges', () => {
        it('should set the writeChanges function', () => {
            transactionModel.setWriteChanges(mockWriteChanges);
            expect(transactionModel['writeChanges']).toBe(mockWriteChanges);
        });

        it('should finish transaction if changes exist', async () => {
            transactionModel.startTransaction();
            transactionModel['changes'] = { key: 'value' };
            transactionModel.setWriteChanges(mockWriteChanges);
            await transactionModel['writeChangesPromise'];
            expect(transactionModel.isTransactionActive).toBe(false);
            expect(mockWriteChanges).toHaveBeenCalled();
        });

        it('should abort transaction if no changes exist', () => {
            transactionModel.startTransaction();
            transactionModel.setWriteChanges(mockWriteChanges);
            expect(transactionModel.isTransactionActive).toBe(false);

            expect(mockLogger.warn).toHaveBeenCalledWith(
                'No transaction active',
            );
        });
    });

    // Test logger functionality
    describe('Logger functionality', () => {
        let transactionModel: TransactionModel<any>;

        beforeEach(() => {
            transactionModel = new TransactionModel(
                mockWriteChanges,
                mockLogger,
            );
        });

        it('should log debug messages', async () => {
            // @ts-ignore: Accessing private method for testing purposes
            transactionModel.callWriteChanges();
            await transactionModel['writeChangesPromise'];
            expect(mockLogger.debug).toHaveBeenCalled();
        });

        it('should log error messages', async () => {
            const errorWriteChanges = jest
                .fn()
                .mockRejectedValue('Write failed'); // Mock the rejection with a string instead of an Error object

            transactionModel = new TransactionModel(
                errorWriteChanges,
                mockLogger,
            );
            // @ts-ignore: Accessing private method for testing purposes
            const result = transactionModel.callWriteChanges();
            await expect(result.promise).rejects.toEqual('Write failed'); // Ensure the promise is rejected with the correct value

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Failed to write changes to file:',
                'Write failed',
            );
        });
    });
});
