module.exports = {
  collectCoverage: true,
  coverageDirectory: "../../../coverage/core",
  coverageReporters: [
    ['lcov', { file: 'react.info'}]
  ],
  preset: "ts-jest",
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
};
