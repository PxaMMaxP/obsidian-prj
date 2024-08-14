module.exports = {
    setupFilesAfterEnv: ['./scripts/jest.setup.js'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(test).ts'],
    testPathIgnorePatterns: ['\\.spec\\.ts$', '\\.performance\\.test\\.ts$'],
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1', // Map src to the source folder
        '^ts-injex$': '<rootDir>/node_modules/ts-injex/src', // Map ts-injex to the source folder
    },
    transformIgnorePatterns: [
        'node_modules/(?!ts-injex)' // **Dont** ignore ts-injex on preset `ts-jest`
    ],
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