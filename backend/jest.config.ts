import * as fs from 'fs';
import * as path from 'path';
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const tsconfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf-8'),
) as { compilerOptions?: { paths?: Record<string, string[]> } };

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions?.paths ?? {}, {
    prefix: '<rootDir>/',
  }),
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tests/tsconfig.json' }],
  },
  testTimeout: 30000,
};

export default config;
