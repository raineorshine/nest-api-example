import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

export default {
  projects: [
    {
      displayName: 'Unit test',
      testEnvironment: 'node',
      rootDir: 'src',
      testRegex: '\\.spec\\.ts$',
      moduleDirectories: ['node_modules', __dirname],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      setupFilesAfterEnv: ['jest-ts-auto-mock', 'dotenv/config'],
      transform: {
        '^.+\\.ts$': [
          'ts-jest',
          {
            compiler: 'ttypescript',
            tsconfig: 'tsconfig.test.json',
          },
        ],
      },
    },
    {
      displayName: 'E2E test',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: 'test',
      testRegex: '\\.e2e-spec\\.ts$',
      moduleDirectories: ['node_modules', __dirname],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      setupFilesAfterEnv: ['dotenv/config'],
    },
  ],
};
