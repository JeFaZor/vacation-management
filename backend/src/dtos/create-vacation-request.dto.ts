import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'endDateAfterStart', async: false })
class EndDateAfterStartConstraint implements ValidatorConstraintInterface {
  validate(endDate: unknown, args: ValidationArguments): boolean {
    const obj = args.object as CreateVacationRequestDto;
    if (typeof endDate !== 'string' || typeof obj.startDate !== 'string') {
      return false;
    }
    return endDate >= obj.startDate;
  }
  defaultMessage(): string {
    return 'endDate must be greater than or equal to startDate.';
  }
}

@ValidatorConstraint({ name: 'startDateNotInPast', async: false })
class StartDateNotInPastConstraint implements ValidatorConstraintInterface {
  validate(startDate: unknown): boolean {
    if (typeof startDate !== 'string') {
      return false;
    }
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return startDate >= todayStr;
  }
  defaultMessage(): string {
    return 'startDate must not be in the past.';
  }
}

export class CreateVacationRequestDto {
  @IsDateString({ strict: true }, { message: 'startDate must be a valid ISO date (YYYY-MM-DD).' })
  @Validate(StartDateNotInPastConstraint)
  startDate!: string;

  @IsDateString({ strict: true }, { message: 'endDate must be a valid ISO date (YYYY-MM-DD).' })
  @Validate(EndDateAfterStartConstraint)
  endDate!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'reason must be a string.' })
  @MaxLength(1000, { message: 'reason must be at most 1000 characters.' })
  reason?: string | null;
}
