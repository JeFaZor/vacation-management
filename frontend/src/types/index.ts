export type Role = 'Requester' | 'Validator'

export type Status = 'Pending' | 'Approved' | 'Rejected'

export interface User {
  id: number
  name: string
  role: Role
}

export interface VacationRequest {
  id: number
  startDate: string
  endDate: string
  reason: string | null
  status: Status
  comments: string | null
  createdAt: string
  updatedAt: string
  user: User
  validator: User | null
}
