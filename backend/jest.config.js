module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controllers/**/*.js',
        'models/**/*.js',
        'services/**/*.js',
        'middlewares/**/*.js',
        '!**/__tests__/**',
        '!**/__mocks__/**'
    ],
    testMatch: [
        '**/__tests__/**/*.test.js'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testTimeout: 10000,
    verbose: true
};
