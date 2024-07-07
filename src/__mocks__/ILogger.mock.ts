import { ILogger } from 'src/interfaces/ILogger';

const loggerMock: ILogger = {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
};

export default loggerMock;
