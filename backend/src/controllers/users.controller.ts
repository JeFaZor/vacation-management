import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await AppDataSource.getRepository(User).find({ order: { id: 'ASC' } });
    res.json(
      users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
    );
  } catch (err) {
    next(err);
  }
}
