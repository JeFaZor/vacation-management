import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '../types'

const STORAGE_KEY = 'currentUser'

function readFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as User
    if (
      typeof parsed?.id === 'number' &&
      typeof parsed?.name === 'string' &&
      (parsed?.role === 'Requester' || parsed?.role === 'Validator')
    ) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(readFromStorage())

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isRequester = computed(() => currentUser.value?.role === 'Requester')
  const isValidator = computed(() => currentUser.value?.role === 'Validator')

  function login(user: User) {
    currentUser.value = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    currentUser,
    isAuthenticated,
    isRequester,
    isValidator,
    login,
    logout,
  }
})
