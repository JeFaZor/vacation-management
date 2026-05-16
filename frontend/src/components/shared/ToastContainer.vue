<script setup lang="ts">
import { useToastStore, type Toast } from '../../stores/toast'

const toastStore = useToastStore()

function variantClasses(variant: Toast['variant']): string {
  return variant === 'success'
    ? 'border-emerald-200 bg-white/95 text-emerald-800'
    : 'border-rose-200 bg-white/95 text-rose-800'
}

function iconAccent(variant: Toast['variant']): string {
  return variant === 'success'
    ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
    : 'bg-rose-50 text-rose-600 ring-rose-200'
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-3 sm:top-5 sm:items-end sm:px-5"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur',
            variantClasses(toast.variant),
          ]"
          role="status"
        >
          <span
            :class="[
              'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
              iconAccent(toast.variant),
            ]"
            aria-hidden="true"
          >
            <svg
              v-if="toast.variant === 'success'"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
            <svg
              v-else
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </span>
          <p class="min-w-0 flex-1 pt-0.5 text-sm leading-snug">
            {{ toast.message }}
          </p>
          <button
            type="button"
            class="-mr-1 -mt-1 rounded-md p-1 text-alpine-muted transition hover:bg-alpine-surface hover:text-alpine-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Dismiss notification"
            @click="toastStore.dismiss(toast.id)"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition:
    opacity 220ms ease-out,
    transform 220ms ease-out;
}
.toast-leave-active {
  transition:
    opacity 180ms ease-in,
    transform 180ms ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.toast-move {
  transition: transform 220ms ease-out;
}
</style>
