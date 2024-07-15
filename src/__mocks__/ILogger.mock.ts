import { ILogger, ILogger_ } from 'src/interfaces/ILogger';

const MockLogger: ILogger = {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    setLogLevel: jest.fn(),
};

export const MockLogger_: ILogger_ = {
    getLogger: jest.fn(() => MockLogger),
    getInstance: jest.fn(() => MockLogger),
} as unknown as ILogger_;

export default MockLogger;
