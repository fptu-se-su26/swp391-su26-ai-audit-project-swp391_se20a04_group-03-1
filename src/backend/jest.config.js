/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/scan.controller.ts',
    'models/appointment.model.ts',
    'controllers/appointment.controller.ts',
    'repositories/appointment.repository.ts',
    'repositories/gateTransaction.repository.ts'
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "appointment.integration.test.ts"
  ],
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['./tests/jest.setup.ts'],
  coverageReporters: ['lcov', 'text-summary', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
