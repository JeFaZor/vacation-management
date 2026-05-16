import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastVariant = 'success' | 'error'

export interface Toast {
  id: number
  variant: ToastVariant
  message: string
}

const DEFAULT_DURATION_MS = 4000

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  const timers = new Map<number, ReturnType<typeof setTimeout>>()
  let nextId = 1

  function dismiss(id: number) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(variant: ToastVariant, message: string, durationMs = DEFAULT_DURATION_MS): number {
    const id = nextId++
    toasts.value = [...toasts.value, { id, variant, message }]
    if (durationMs > 0) {
      const timer = setTimeout(() => dismiss(id), durationMs)
      timers.set(id, timer)
    }
    return id
  }

  function success(message: string, durationMs?: number): number {
    return push('success', message, durationMs)
  }

  function error(message: string, durationMs?: number): number {
    return push('error', message, durationMs)
  }

  return { toasts, success, error, dismiss }
})
