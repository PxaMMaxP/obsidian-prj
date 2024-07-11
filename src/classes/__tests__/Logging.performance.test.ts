/* eslint-disable no-console */
import { Logging } from '../Logging';

describe('Logging Performance Test', () => {
    let consoleTraceSpy: jest.SpyInstance;
    let consoleDebugSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleTraceSpy = jest
            .spyOn(console, 'trace')
            .mockImplementation(() => {});

        consoleDebugSpy = jest
            .spyOn(console, 'debug')
            .mockImplementation(() => {});

        consoleInfoSpy = jest
            .spyOn(console, 'info')
            .mockImplementation(() => {});

        consoleWarnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {});

        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    it('should measure performance of 1000 calls with logging disabled', () => {
        const logger = new Logging('none');

        const startTime = performance.now();

        for (let i = 0; i < 1000; i++) {
            logger.trace('trace message');
            logger.debug('debug message');
            logger.info('info message');
            logger.warn('warn message');
            logger.error('error message');
        }
        const endTime = performance.now();

        expect(consoleTraceSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).toHaveBeenCalledWith('Logging disabled');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleInfoSpy.mockRestore();

        console.info(
            `Time for 1000 calls with logging **disabled**: ${endTime - startTime} ms`,
        );
    });

    it('should measure performance of 1000 calls with logging enabled', () => {
        const logger = new Logging('trace');

        const startTime = performance.now();

        for (let i = 0; i < 1000; i++) {
            logger.trace('trace message');
            logger.debug('debug message');
            logger.info('info message');
            logger.warn('warn message');
            logger.error('error message');
        }
        const endTime = performance.now();

        expect(consoleTraceSpy).toHaveBeenCalledTimes(1000);
        expect(consoleDebugSpy).toHaveBeenCalledTimes(1000);
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1001);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1000);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1000);

        consoleInfoSpy.mockRestore();

        console.info(
            `Time for 1000 calls with logging **enabled**: ${endTime - startTime} ms`,
        );
    });
});
