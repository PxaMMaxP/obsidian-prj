import { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { TSinjex } from 'ts-injex';

interface ILoggerMock_ {
    reset: () => void;
}

interface ILoggerMock {
    warn: {
        mockClear: () => void;
    };
    info: {
        mockClear: () => void;
    };
    error: {
        mockClear: () => void;
    };
    trace: {
        mockClear: () => void;
    };
    debug: {
        mockClear: () => void;
    };
    setLogLevel: {
        mockClear: () => void;
    };
}

const MockLogger: ILogger = {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    setLogLevel: jest.fn(),
};

const MockLogger_: ILogger_ & ILoggerMock_ = {
    getLogger: jest.fn(() => MockLogger),
    getInstance: jest.fn(() => MockLogger),
    reset: () => {
        const logger = MockLogger as unknown as ILoggerMock;
        logger.warn.mockClear();
        logger.info.mockClear();
        logger.error.mockClear();
        logger.trace.mockClear();
        logger.debug.mockClear();
        logger.setLogLevel.mockClear();
    },
} as unknown as ILogger_ & ILoggerMock_;

/**
 * Register the mock logger on the DI container
 * as `ILogger_`.
 */
export function registerMockLogger(): void {
    TSinjex.register('ILogger_', MockLogger_);
}

const UndefinedMockLogger_: ILogger_ & ILoggerMock_ = {
    getLogger: jest.fn(() => undefined),
    getInstance: jest.fn(() => undefined),
    reset: () => {
        const logger = MockLogger as unknown as ILoggerMock;
        logger.warn.mockClear();
        logger.info.mockClear();
        logger.error.mockClear();
        logger.trace.mockClear();
        logger.debug.mockClear();
        logger.setLogLevel.mockClear();
    },
} as unknown as ILogger_ & ILoggerMock_;

/**
 * Register an empty mock logger on the DI container
 */
export function registerEmptyMockLogger(): void {
    TSinjex.register('ILogger_', UndefinedMockLogger_);
}

/**
 * Reset the mock logger.
 */
export function resetMockLogger(): void {
    MockLogger_.reset();
}

export { MockLogger_ };
export default MockLogger;
