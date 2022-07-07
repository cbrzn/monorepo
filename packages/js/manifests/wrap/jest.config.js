module.exports = {
  collectCoverage: true,
  coverageDirectory: "../../../../coverage/core",
  coverageReporters: [
    ['lcov', { file: 'wrap-manifests-js.info'}]
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  modulePathIgnorePatterns: ['./src/__tests__/wrappers'],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};
