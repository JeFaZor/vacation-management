import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../../src/stores/user'
import type { User } from '../../src/types'

const ALICE: User = { id: 1, name: 'Alice', role: 'Requester' }
const CAROL: User = { id: 3, name: 'Carol', role: 'Validator' }

describe('user store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts with currentUser = null when localStorage is empty', () => {
    const store = useUserStore()
    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isRequester).toBe(false)
    expect(store.isValidator).toBe(false)
  })

  it('login() sets currentUser and persists to localStorage', () => {
    const store = useUserStore()
    store.login(ALICE)

    expect(store.currentUser).toEqual(ALICE)
    expect(JSON.parse(localStorage.getItem('currentUser') as string)).toEqual(ALICE)
  })

  it('logout() clears state and removes the storage key', () => {
    const store = useUserStore()
    store.login(ALICE)
    store.logout()

    expect(store.currentUser).toBeNull()
    expect(localStorage.getItem('currentUser')).toBeNull()
  })

  it('role getters reflect the current user', () => {
    const store = useUserStore()

    store.login(ALICE)
    expect(store.isAuthenticated).toBe(true)
    expect(store.isRequester).toBe(true)
    expect(store.isValidator).toBe(false)

    store.login(CAROL)
    expect(store.isRequester).toBe(false)
    expect(store.isValidator).toBe(true)
  })
})
