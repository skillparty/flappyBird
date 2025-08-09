// Minimal Jest config after purging unused architecture (scenes/managers/components removed)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  // Only run the single retained test
  testMatch: ['**/tests/app.test.ts'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  collectCoverageFrom: ['src/app.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 5000
};