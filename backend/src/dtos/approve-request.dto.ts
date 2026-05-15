import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveRequestDto {
  @IsOptional()
  @IsString({ message: 'comments must be a string.' })
  @MaxLength(1000, { message: 'comments must be at most 1000 characters.' })
  comments?: string;
}
