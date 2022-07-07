module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: "../../../../coverage/plugins",
  coverageReporters: [
    ['lcov', { file: 'graph-node.info'}]
  ],
}
