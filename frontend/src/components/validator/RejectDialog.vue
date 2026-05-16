<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { VacationRequest } from '../../types'

const props = defineProps<{
  open: boolean
  request: VacationRequest | null
  submitting: boolean
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [string]
}>()

const MAX_COMMENT = 1000

const comments = ref('')
const dialogRef = ref<HTMLDivElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
let previousActive: HTMLElement | null = null

const trimmed = computed(() => comments.value.trim())
const canConfirm = computed(() => trimmed.value.length > 0 && !props.submitting)
const count = computed(() => comments.value.length)
const over = computed(() => count.value > MAX_COMMENT)

function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function formatRange(start: string, end: string): string {
  const s = parseDateLocal(start)
  const e = parseDateLocal(end)
  const sameYear = s.getFullYear() === e.getFullYear()
  const monthDay = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (sameYear) return `${monthDay(s)} – ${monthDay(e)}, ${e.getFullYear()}`
  return `${monthDay(s)}, ${s.getFullYear()} – ${monthDay(e)}, ${e.getFullYear()}`
}

const rangeLabel = computed(() =>
  props.request ? formatRange(props.request.startDate, props.request.endDate) : '',
)

function getFocusable(): HTMLElement[] {
  const root = dialogRef.value
  if (!root) return []
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('aria-hidden'),
  )
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    if (!props.submitting) emit('cancel')
    return
  }
  if (event.key === 'Tab') {
    const items = getFocusable()
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (event.shiftKey && active === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first?.focus()
    }
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previousActive = document.activeElement as HTMLElement | null
      comments.value = ''
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
      await nextTick()
      textareaRef.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
      previousActive?.focus?.()
      previousActive = null
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

function onOverlay() {
  if (props.submitting) return
  emit('cancel')
}

function onCancel() {
  if (props.submitting) return
  emit('cancel')
}

function onConfirm() {
  if (!canConfirm.value || over.value) return
  emit('confirm', trimmed.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open && request"
        class="fixed inset-0 z-40 flex items-center justify-center bg-alpine-ink/40 px-3 py-4 backdrop-blur-sm sm:px-4"
        role="presentation"
        @click.self="onOverlay"
      >
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
          aria-describedby="reject-dialog-desc"
          class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
        >
          <div class="border-b border-alpine-border bg-gradient-to-br from-rose-50 to-white px-6 py-5">
            <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-700">
              Reject request
            </p>
            <h2
              id="reject-dialog-title"
              class="mt-1 font-display text-xl font-semibold text-alpine-ink"
            >
              Decline this vacation request?
            </h2>
            <p
              id="reject-dialog-desc"
              class="mt-1 text-sm text-alpine-muted"
            >
              {{ request.user.name }} · {{ rangeLabel }}
            </p>
          </div>

          <div class="px-6 py-5">
            <label
              for="reject-comments"
              class="block text-sm font-medium text-alpine-ink"
            >
              Comments
              <span class="ml-1 text-xs font-normal text-rose-600">required</span>
            </label>
            <p class="mt-1 text-xs text-alpine-muted">
              Share context for the requester — this will be visible to them.
            </p>
            <textarea
              id="reject-comments"
              ref="textareaRef"
              v-model="comments"
              rows="4"
              :maxlength="MAX_COMMENT"
              :disabled="submitting"
              placeholder="e.g. Insufficient coverage during requested period."
              :aria-invalid="over || undefined"
              :class="[
                'mt-2 block w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-alpine-ink shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-alpine-surface/60',
                over
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                  : 'border-alpine-border focus:border-primary-400 focus:ring-primary-200',
              ]"
            />
            <div class="mt-1.5 flex items-center justify-between">
              <p class="text-xs text-alpine-muted">
                The requester will see this note alongside the rejection.
              </p>
              <span
                :class="[
                  'text-xs tabular-nums',
                  over ? 'text-rose-600' : 'text-alpine-muted',
                ]"
              >
                {{ count }} / {{ MAX_COMMENT }}
              </span>
            </div>
          </div>

          <div
            class="flex flex-col-reverse gap-2 border-t border-alpine-border bg-alpine-surface/40 px-6 py-4 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              :disabled="submitting"
              class="inline-flex items-center justify-center rounded-lg border border-alpine-border bg-white px-4 py-2 text-sm font-medium text-alpine-ink shadow-sm transition hover:bg-alpine-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              @click="onCancel"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="!canConfirm || over"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-rose-300"
              @click="onConfirm"
            >
              <svg
                v-if="submitting"
                class="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {{ submitting ? 'Rejecting…' : 'Confirm reject' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 180ms ease-out;
}
.dialog-enter-active > div,
.dialog-leave-active > div {
  transition:
    opacity 200ms ease-out,
    transform 200ms ease-out;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from > div,
.dialog-leave-to > div {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
