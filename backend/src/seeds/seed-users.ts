import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';

const SEED_USERS: Array<{ name: string; role: UserRole }> = [
  { name: 'Alice', role: 'Requester' },
  { name: 'Bob', role: 'Requester' },
  { name: 'Carol', role: 'Validator' },
  { name: 'Dave', role: 'Validator' },
];

export async function seedUsers(): Promise<{ inserted: number; skipped: boolean }> {
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.count();
  if (existing > 0) {
    return { inserted: 0, skipped: true };
  }
  const created = userRepo.create(SEED_USERS);
  await userRepo.save(created);
  return { inserted: created.length, skipped: false };
}

async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const result = await seedUsers();
    if (result.skipped) {
      console.log('Seed skipped: users table already populated.');
    } else {
      console.log(`Seed inserted ${result.inserted} users.`);
    }
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
