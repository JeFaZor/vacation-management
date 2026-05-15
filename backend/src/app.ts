import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import { errorHandler } from './middleware/error-handler';

const app: Express = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
