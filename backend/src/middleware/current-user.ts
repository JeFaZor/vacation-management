import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { AppError } from '../utils/app-error';

export async function currentUserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const headerValue = req.header('X-User-Id');
    if (!headerValue) {
      throw new AppError(401, 'Missing X-User-Id header.');
    }
    const userId = Number(headerValue);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError(401, 'Invalid X-User-Id header.');
    }
    const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(401, 'Unknown user.');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
