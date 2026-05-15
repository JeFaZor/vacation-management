import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

import { AppDataSource } from '@/data-source';
import { seedUsers } from '@/seeds/seed-users';

beforeAll(async () => {
  if (process.env.DB_NAME !== 'vacation_management_test') {
    throw new Error(
      `Refusing to run tests against DB '${process.env.DB_NAME}'. Expected 'vacation_management_test'.`,
    );
  }
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.runMigrations();
  await seedUsers();
});

beforeEach(async () => {
  await AppDataSource.query(
    'TRUNCATE TABLE "vacation_requests" RESTART IDENTITY CASCADE;',
  );
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
