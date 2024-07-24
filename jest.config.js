module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(test).ts'],
    testPathIgnorePatterns: ['\\.spec\\.ts$', '\\.performance\\.test\\.ts$'],
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
};