import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import {
  VacationRequest,
  VacationRequestStatus,
} from '../entities/VacationRequest';
import { CreateVacationRequestDto } from '../dtos/create-vacation-request.dto';
import { ApproveRequestDto } from '../dtos/approve-request.dto';
import { RejectRequestDto } from '../dtos/reject-request.dto';
import { validateBody } from '../utils/validation';
import { AppError } from '../utils/app-error';

const ALLOWED_STATUSES: VacationRequestStatus[] = ['Pending', 'Approved', 'Rejected'];

function serializeUser(user: User | null | undefined): {
  id: number;
  name: string;
  role: User['role'];
} | null {
  if (!user) return null;
  return { id: user.id, name: user.name, role: user.role };
}

function serializeRequest(r: VacationRequest): Record<string, unknown> {
  return {
    id: r.id,
    startDate: r.startDate,
    endDate: r.endDate,
    reason: r.reason,
    status: r.status,
    comments: r.comments,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: serializeUser(r.user),
    validator: serializeUser(r.validator),
  };
}

export async function createRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = await validateBody(CreateVacationRequestDto, req.body);
    const repo = AppDataSource.getRepository(VacationRequest);
    const entity = repo.create({
      userId: req.user!.id,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason ?? null,
      status: 'Pending',
      comments: null,
      validatorId: null,
    });
    const saved = await repo.save(entity);
    const full = await repo.findOne({
      where: { id: saved.id },
      relations: { user: true, validator: true },
    });
    res.status(201).json(serializeRequest(full!));
  } catch (err) {
    next(err);
  }
}

export async function listMyRequests(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const repo = AppDataSource.getRepository(VacationRequest);
    const rows = await repo.find({
      where: { userId: req.user!.id },
      relations: { user: true, validator: true },
      order: { createdAt: 'DESC' },
    });
    res.json(rows.map(serializeRequest));
  } catch (err) {
    next(err);
  }
}

export async function listAllRequests(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const statusParam = req.query.status;
    let statusFilter: VacationRequestStatus | undefined;
    if (statusParam !== undefined) {
      if (typeof statusParam !== 'string' || !ALLOWED_STATUSES.includes(statusParam as VacationRequestStatus)) {
        throw new AppError(400, 'Invalid status query parameter.', [
          { field: 'status', messages: [`status must be one of: ${ALLOWED_STATUSES.join(', ')}.`] },
        ]);
      }
      statusFilter = statusParam as VacationRequestStatus;
    }

    const repo = AppDataSource.getRepository(VacationRequest);
    const rows = await repo.find({
      where: statusFilter ? { status: statusFilter } : {},
      relations: { user: true, validator: true },
      order: { createdAt: 'DESC' },
    });
    res.json(rows.map(serializeRequest));
  } catch (err) {
    next(err);
  }
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(404, 'Vacation request not found.');
  }
  return id;
}

export async function approveRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const dto = await validateBody(ApproveRequestDto, req.body);
    const repo = AppDataSource.getRepository(VacationRequest);
    const entity = await repo.findOne({
      where: { id },
      relations: { user: true, validator: true },
    });
    if (!entity) {
      throw new AppError(404, 'Vacation request not found.');
    }
    if (entity.status !== 'Pending') {
      throw new AppError(409, `Request is already ${entity.status}.`);
    }
    entity.status = 'Approved';
    entity.validatorId = req.user!.id;
    if (dto.comments !== undefined) {
      entity.comments = dto.comments;
    }
    await repo.save(entity);
    const full = await repo.findOne({
      where: { id },
      relations: { user: true, validator: true },
    });
    res.json(serializeRequest(full!));
  } catch (err) {
    next(err);
  }
}

export async function rejectRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const dto = await validateBody(RejectRequestDto, req.body);
    const repo = AppDataSource.getRepository(VacationRequest);
    const entity = await repo.findOne({
      where: { id },
      relations: { user: true, validator: true },
    });
    if (!entity) {
      throw new AppError(404, 'Vacation request not found.');
    }
    if (entity.status !== 'Pending') {
      throw new AppError(409, `Request is already ${entity.status}.`);
    }
    entity.status = 'Rejected';
    entity.validatorId = req.user!.id;
    entity.comments = dto.comments;
    await repo.save(entity);
    const full = await repo.findOne({
      where: { id },
      relations: { user: true, validator: true },
    });
    res.json(serializeRequest(full!));
  } catch (err) {
    next(err);
  }
}
