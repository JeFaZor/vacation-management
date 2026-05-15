import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './data-source';

const port = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log('DataSource initialized: connected to PostgreSQL.');

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});
