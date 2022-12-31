export default {
  verbose: true,
  testRegex: ['.*\\.test\\.(js|ts)$'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
        diagnostics: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleDirectories: ['node_modules'],
  preset: 'ts-jest',
  setupFiles: ['dotenv/config'],
  testMatch: null,
  testEnvironment: 'node',
};
