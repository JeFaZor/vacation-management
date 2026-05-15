import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../entities/User';
import { AppError } from '../utils/app-error';

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated.'));
    }
    if (req.user.role !== role) {
      return next(new AppError(403, `This action requires role: ${role}.`));
    }
    next();
  };
}
