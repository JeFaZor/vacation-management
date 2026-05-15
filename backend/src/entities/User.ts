import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VacationRequest } from './VacationRequest';

export type UserRole = 'Requester' | 'Validator';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: ['Requester', 'Validator'], enumName: 'user_role' })
  role!: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @OneToMany(() => VacationRequest, (request) => request.user)
  vacationRequests?: VacationRequest[];

  @OneToMany(() => VacationRequest, (request) => request.validator)
  validatedRequests?: VacationRequest[];
}
