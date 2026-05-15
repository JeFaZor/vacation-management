import axios from 'axios'
import type { Status, User, VacationRequest } from '../types'
import { useUserStore } from '../stores/user'
import router from '../router'

const STORAGE_KEY = 'currentUser'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const user = JSON.parse(raw) as User
      if (typeof user?.id === 'number') {
        config.headers.set('X-User-Id', String(user.id))
      }
    } catch {
      // ignore malformed payload
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/')
    }
    return Promise.reject(error)
  },
)

export interface CreateVacationRequestPayload {
  startDate: string
  endDate: string
  reason?: string
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return data
}

export async function submitRequest(
  payload: CreateVacationRequestPayload,
): Promise<VacationRequest> {
  const { data } = await api.post<VacationRequest>('/vacation-requests', payload)
  return data
}

export async function fetchMyRequests(): Promise<VacationRequest[]> {
  const { data } = await api.get<VacationRequest[]>('/vacation-requests/my')
  return data
}

export async function fetchAllRequests(
  status?: Status,
): Promise<VacationRequest[]> {
  const { data } = await api.get<VacationRequest[]>('/vacation-requests', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function approveRequest(
  id: number,
  comments?: string,
): Promise<VacationRequest> {
  const { data } = await api.patch<VacationRequest>(
    `/vacation-requests/${id}/approve`,
    comments ? { comments } : {},
  )
  return data
}

export async function rejectRequest(
  id: number,
  comments: string,
): Promise<VacationRequest> {
  const { data } = await api.patch<VacationRequest>(
    `/vacation-requests/${id}/reject`,
    { comments },
  )
  return data
}

export default api
