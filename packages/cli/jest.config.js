module.exports = {
  collectCoverage: true,
  coverageDirectory: "../../coverage/cli",
  coverageReporters: [
    ['lcov', { file: 'cli.info'}]
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    "ts-jest": {
      diagnostics: false
    },
  },
  modulePathIgnorePatterns: [
    "<rootDir>/src/__tests__/project/.polywrap"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/project/.polywrap"
  ],
  transformIgnorePatterns: [
    "<rootDir>/src/__tests__/project/.polywrap"
  ],
  setupFilesAfterEnv: ["./jest.setup.js"],
};
