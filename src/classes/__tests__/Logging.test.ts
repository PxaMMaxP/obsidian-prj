/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logging, LoggingLevel, LoggingLevelNumber } from '../Logging';

interface ILoggerPrivate {
    logLevelActive(logLevel: LoggingLevelNumber): boolean;
    constructLogMessage(message?: any): string;
}

describe('Logging Class', () => {
    let consoleInfoSpy: jest.SpyInstance;
    let consoleTraceSpy: jest.SpyInstance;
    let consoleDebugSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleInfoSpy = jest
            .spyOn(console, 'info')
            .mockImplementation(() => {});

        consoleTraceSpy = jest
            .spyOn(console, 'debug')
            .mockImplementation(() => {});

        consoleDebugSpy = jest
            .spyOn(console, 'debug')
            .mockImplementation(() => {});

        consoleWarnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {});

        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        consoleInfoSpy.mockRestore();
        consoleDebugSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should create a new logging instance using the singleton pattern with default logging level', () => {
        const logger = Logging.getInstance();
        expect(logger).toBeDefined();
    });

    it('should create a new Logging instance with default log level', () => {
        const logger = new Logging();
        expect(logger).toBeDefined();
    });

    it('should log "Logging disabled" when log level is "none"', () => {
        new Logging('none');
        expect(consoleInfoSpy).toHaveBeenCalledWith('Logging disabled');
    });

    it('should set the log level and log the change', () => {
        const logger = new Logging();
        logger.setLogLevel('debug');
        expect(consoleInfoSpy).toHaveBeenCalledWith('Log level set to debug');
    });

    it('should return the same instance from getInstance', () => {
        const instance1 = Logging.getInstance();
        const instance2 = Logging.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should return an ILogger with prefixed log methods from getLogger', () => {
        Logging.getInstance().setLogLevel('info');
        const logger = Logging.getLogger('TestPrefix');
        logger.info('Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
            'TestPrefix: ',
            'Test message',
        );
    });

    it('should log messages at the appropriate levels', () => {
        const logger = new Logging('trace');
        logger.trace('trace message');
        logger.debug('debug message');
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');

        expect(consoleDebugSpy).toHaveBeenCalledWith('trace message');
        expect(consoleDebugSpy).toHaveBeenCalledWith('debug message');
        expect(consoleInfoSpy).toHaveBeenCalledWith('info message');
        expect(consoleWarnSpy).toHaveBeenCalledWith('warn message');
        expect(consoleErrorSpy).toHaveBeenCalledWith('error message');
    });

    it('should log messages at the appropriate levels with getLogger', () => {
        const logger = Logging.getLogger('TestPrefix');
        const instance = Logging.getInstance();
        instance.setLogLevel('trace');

        logger.trace('trace message');
        logger.debug('debug message');
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');

        expect(consoleDebugSpy).toHaveBeenCalledWith(
            'TestPrefix: ',
            'trace message',
        );

        expect(consoleDebugSpy).toHaveBeenCalledWith(
            'TestPrefix: ',
            'debug message',
        );

        expect(consoleInfoSpy).toHaveBeenCalledWith(
            'TestPrefix: ',
            'info message',
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'TestPrefix: ',
            'warn message',
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'TestPrefix: ',
            'error message',
        );
    });

    it('should log only error messages when the log level is "error"', () => {
        const logger = new Logging('error');
        logger.trace('trace message');
        logger.debug('debug message');
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');

        expect(consoleTraceSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).toHaveBeenCalledWith('Log level set to error');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('error message');
    });

    it('should not log messages if the log level is not active', () => {
        const logger = new Logging('warn');
        logger.debug('debug message');
        logger.info('info message');
        expect(consoleDebugSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).toHaveBeenCalledWith('Log level set to warn');
    });

    it('should not log any messages if the log level is "none"', () => {
        const logger = new Logging('none');
        logger.trace('trace message');
        logger.debug('debug message');
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');
        expect(consoleTraceSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).toHaveBeenCalledWith('Logging disabled');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined log level and logs on default level', () => {
        const logger = new Logging('none from list' as LoggingLevel);
        logger.trace('trace message');
        logger.debug('debug message');
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');

        expect(consoleTraceSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();

        expect(consoleInfoSpy).toHaveBeenNthCalledWith(
            1,
            'Log level set to info',
        );
        expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, 'info message');
        expect(consoleWarnSpy).toHaveBeenCalledWith('warn message');
        expect(consoleErrorSpy).toHaveBeenCalledWith('error message');
    });

    it('should handle undefined log message correctly', () => {
        const logger = new Logging('info');
        logger.info(undefined);
        expect(consoleInfoSpy).toHaveBeenCalledWith('undefined');
    });

    it('should create a prefixed log message using constructLogMessage', () => {
        const logger = new Logging('info', 'Prefix');

        const message = (logger as unknown as ILoggerPrivate)[
            'constructLogMessage'
        ]('test message');
        expect(message).toBe('Prefix-test message');
    });

    it('should correctly evaluate active log levels', () => {
        const logger = new Logging('info') as unknown as ILoggerPrivate;
        expect(logger['logLevelActive'](LoggingLevelNumber.trace)).toBe(false);
        expect(logger['logLevelActive'](LoggingLevelNumber.debug)).toBe(false);
        expect(logger['logLevelActive'](LoggingLevelNumber.info)).toBe(true);
        expect(logger['logLevelActive'](LoggingLevelNumber.warn)).toBe(true);
        expect(logger['logLevelActive'](LoggingLevelNumber.error)).toBe(true);
    });
});
