import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { AppError } from './app-error';

interface FieldError {
  field: string;
  messages: string[];
}

function flattenErrors(errors: ValidationError[], parentPath = ''): FieldError[] {
  const out: FieldError[] = [];
  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;
    if (err.constraints) {
      out.push({ field: path, messages: Object.values(err.constraints) });
    }
    if (err.children && err.children.length > 0) {
      out.push(...flattenErrors(err.children, path));
    }
  }
  return out;
}

export async function validateBody<T extends object>(
  dtoClass: ClassConstructor<T>,
  body: unknown,
): Promise<T> {
  const instance = plainToInstance(dtoClass, body ?? {}, {
    enableImplicitConversion: false,
  });
  const errors = await validate(instance as object, {
    whitelist: false,
    forbidNonWhitelisted: false,
  });
  if (errors.length > 0) {
    throw new AppError(400, 'Validation failed.', flattenErrors(errors));
  }
  return instance;
}
