import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useToastStore } from '../../src/stores/toast'

describe('toast store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('success() pushes a toast with variant="success"', () => {
    const store = useToastStore()
    store.success('Saved!')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]).toMatchObject({ variant: 'success', message: 'Saved!' })
  })

  it('error() pushes a toast with variant="error"', () => {
    const store = useToastStore()
    store.error('Something broke')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]).toMatchObject({ variant: 'error', message: 'Something broke' })
  })

  it('dismiss(id) removes only the matching toast', () => {
    const store = useToastStore()
    const idA = store.success('A')
    const idB = store.error('B')

    store.dismiss(idA)

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]?.id).toBe(idB)
  })

  it('auto-dismisses after the default duration (4000ms)', () => {
    vi.useFakeTimers()
    const store = useToastStore()
    store.success('Auto-bye')

    expect(store.toasts).toHaveLength(1)

    vi.advanceTimersByTime(3999)
    expect(store.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(store.toasts).toHaveLength(0)
  })
})
