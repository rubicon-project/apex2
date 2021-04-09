module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js'
  ],
  coverageThreshold: {
    global: {
      statements: 80.00,
      branches: 80.00,
      functions: 80.00,
      lines: 80.00
    }
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '\\.(jpg|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  reporters: [
    'default',
    'jest-junit'
  ],
  transform: {
    '^.+\\.(js)$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!@rubicon/apex2-config/)'],
  testResultsProcessor: 'jest-sonar-reporter'
};
