/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/scan.controller.ts',
    'models/appointment.model.ts',
    'models/gateTransaction.model.ts'
  ],
  setupFiles: ['dotenv/config'],
};
