module.exports = {
  collectCoverage: true,
  coverageDirectory: "../../../coverage/core",
  coverageReporters: [
    ['lcov', { file: 'schema-compose.info'}]
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  modulePathIgnorePatterns: ['./src/__tests__/cases'],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};
