module.exports = {
  collectCoverage: true,
  preset: 'ts-jest',
  coverageDirectory: "../../../coverage/client",
  coverageReporters: [
    ['lcov', { file: 'client.info'}]
  ],
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
};
