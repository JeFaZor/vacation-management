import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

export type VacationRequestStatus = 'Pending' | 'Approved' | 'Rejected';

@Entity({ name: 'vacation_requests' })
@Index('idx_vacation_requests_user_id', ['user'])
@Index('idx_vacation_requests_status', ['status'])
@Index('idx_vacation_requests_status_user_id', ['status', 'user'])
export class VacationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.vacationRequests, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected'],
    enumName: 'vacation_request_status',
    default: 'Pending',
  })
  status!: VacationRequestStatus;

  @Column({ type: 'text', nullable: true })
  comments!: string | null;

  @ManyToOne(() => User, (user) => user.validatedRequests, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'validator_id' })
  validator!: User | null;

  @Column({ name: 'validator_id', type: 'int', nullable: true })
  validatorId!: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
