import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error-handler';
import usersRoutes from './routes/users.routes';
import vacationRequestsRoutes from './routes/vacation-requests.routes';

const app: Express = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', usersRoutes);
app.use('/api/vacation-requests', vacationRequestsRoutes);

app.use(errorHandler);

export default app;
