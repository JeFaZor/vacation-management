import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectRequestDto {
  @IsString({ message: 'comments must be a string.' })
  @IsNotEmpty({ message: 'comments is required and must be non-empty.' })
  @MaxLength(1000, { message: 'comments must be at most 1000 characters.' })
  comments!: string;
}
