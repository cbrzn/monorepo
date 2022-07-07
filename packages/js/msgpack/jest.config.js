module.exports = {
  collectCoverage: true,
  coverageDirectory: "../../../coverage/core",
  coverageReporters: [
    ['lcov', { file: 'msgpack.info'}]
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};
