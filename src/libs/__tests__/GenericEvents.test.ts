import MockLogger from 'src/__mocks__/ILogger.mock';
import { ILogger } from 'src/interfaces/ILogger';
import GenericEvents, { ICallback, IEvent } from '../GenericEvents';

interface MyEvents extends ICallback {
    events: {
        myEvent1: IEvent<string, number>;
        myEvent2: IEvent<number, void>;
    };
}

describe('GenericEvents', () => {
    let events: GenericEvents<MyEvents>;

    const runTests = (loggerInstance?: ILogger) => {
        beforeEach(() => {
            events = new GenericEvents<MyEvents>(loggerInstance);
        });

        it('should register an event', () => {
            const callback = jest.fn();
            events.registerEvent('myEvent1', callback);

            if (loggerInstance) {
                expect(loggerInstance.debug).toHaveBeenCalledWith(
                    'Event myEvent1 registered',
                );
            }
        });

        it('should deregister an event', () => {
            const callback = jest.fn();
            events.registerEvent('myEvent1', callback);
            events.deregisterEvent('myEvent1', callback);

            if (loggerInstance) {
                expect(loggerInstance.debug).toHaveBeenCalledWith(
                    'Event myEvent1 deregistered',
                );
            }
        });

        it('should log a warning if trying to deregister a non-existent event', () => {
            const callback = jest.fn();
            events.deregisterEvent('myEvent1', callback);

            if (loggerInstance) {
                expect(loggerInstance.warn).toHaveBeenCalledWith(
                    'Event myEvent1 could not be deregistered',
                );
            }
        });

        it('should fire an event and execute the callback', (done) => {
            const callback = jest.fn((data: string) => 100);

            const resultCallback = jest.fn((result: number) => {
                expect(result).toBe(100);
                done();
            });

            events.registerEvent('myEvent1', callback);
            events.fireEvent('myEvent1', 'Fire event 1', resultCallback);
            expect(callback).toHaveBeenCalledWith('Fire event 1');

            if (loggerInstance) {
                expect(loggerInstance.debug).toHaveBeenCalledWith(
                    'Event myEvent1 fired',
                );
            }
        });

        it('should handle errors in event handlers gracefully', async () => {
            const error = new Error('Test error');

            const callback = jest.fn(() => {
                throw error;
            });

            events.registerEvent('myEvent1', callback);
            events.fireEvent('myEvent1', 'Fire event 1');

            expect(callback).toHaveBeenCalledWith('Fire event 1');

            if (loggerInstance) {
                expect(loggerInstance.error).toHaveBeenCalledWith(
                    `Error in event handler for ${callback.toString()}: ${error}`,
                );
            }
        });

        it('should not fire unregistered events', () => {
            const callback = jest.fn();
            events.fireEvent('myEvent1', 'Fire event 1', callback);
            expect(callback).not.toHaveBeenCalled();
        });

        it('should only deregister the specified callback', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            events.registerEvent('myEvent1', callback1);
            events.registerEvent('myEvent1', callback2);

            events.deregisterEvent('myEvent1', callback1);

            events.fireEvent('myEvent1', 'Fire event 1');
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should handle multiple events correctly', (done) => {
            const results: number[] = [];
            let callbackCount = 0;

            const callback1 = jest.fn((data: string) => {
                results.push(1);

                return 1;
            });

            const callback2 = jest.fn((data: string) => {
                results.push(2);

                return 2;
            });

            const finalCallback = () => {
                callbackCount++;

                if (callbackCount === 2) {
                    try {
                        expect(results).toEqual([1, 2]);
                        done();
                    } catch (error) {
                        done(error);
                    }
                }
            };

            events.registerEvent('myEvent1', callback1);
            events.registerEvent('myEvent1', callback2);

            events.fireEvent('myEvent1', 'Fire event 1', finalCallback);
        });

        it('should execute the callback after the event handler', (done) => {
            const handler = jest.fn((data: string) => 100);

            const callback = jest.fn((result: number) => {
                try {
                    expect(result).toBe(100);
                    done();
                } catch (error) {
                    done(error);
                }
            });

            events.registerEvent('myEvent1', handler);
            events.fireEvent('myEvent1', 'Test data', callback);

            // Wait for the event handler to execute
            setTimeout(() => {
                try {
                    if (loggerInstance) {
                        expect(loggerInstance.debug).toHaveBeenCalledWith(
                            `Callback for ${handler.toString()} executed`,
                        );
                    }
                    done();
                } catch (error) {
                    done(error);
                }
            }, 0);
        });
    };

    describe('with logger', () => {
        runTests(MockLogger);
    });

    describe('without logger', () => {
        runTests();
    });
});
