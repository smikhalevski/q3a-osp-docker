module.exports = {
  verbose: false,
  testURL: 'http://localhost/',
  testPathIgnorePatterns: [
    '<rootDir>/target/',
  ],
  roots: [
    '<rootDir>/src',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
  ],
};
