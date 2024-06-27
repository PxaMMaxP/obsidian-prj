// src/interfaces/ILogger.mock.ts
export const mockLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    trace: jest.fn(),
    info: jest.fn(),
};

export default mockLogger;
