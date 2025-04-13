// @ts-check
/** @type {import('jest').Config} */
export default {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.(js|jsx|ts|tsx)',
    '**/?(*.)+(spec|test).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/__tests__/api', 
    '<rootDir>/__tests__/middleware.test.ts'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  }
}; 