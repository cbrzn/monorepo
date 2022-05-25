module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  modulePathIgnorePatterns: ['./src/__tests__/apis'],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};
