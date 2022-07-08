module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: "../../../../coverage/plugins",
  coverageReporters: [
    ['lcov', { file: 'filesystem.info'}]
  ],
}
