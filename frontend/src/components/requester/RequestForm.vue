<script setup lang="ts">
import { computed, ref } from 'vue'
import axios from 'axios'
import { submitRequest } from '../../services/api'
import type { VacationRequest } from '../../types'

const emit = defineEmits<{ created: [VacationRequest] }>()

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MAX_REASON = 1000
const today = todayIso()

const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const submitting = ref(false)
const successMessage = ref<string | null>(null)
const generalError = ref<string | null>(null)

const fieldErrors = ref<{
  startDate: string | null
  endDate: string | null
  reason: string | null
}>({ startDate: null, endDate: null, reason: null })

const endMin = computed(() => startDate.value || today)
const reasonCount = computed(() => reason.value.length)
const reasonOver = computed(() => reasonCount.value > MAX_REASON)

let successTimer: ReturnType<typeof setTimeout> | null = null

function clearErrors() {
  fieldErrors.value = { startDate: null, endDate: null, reason: null }
  generalError.value = null
}

function validate(): boolean {
  clearErrors()
  let ok = true
  if (!startDate.value) {
    fieldErrors.value.startDate = 'Please choose a start date.'
    ok = false
  } else if (startDate.value < today) {
    fieldErrors.value.startDate = 'Start date cannot be in the past.'
    ok = false
  }
  if (!endDate.value) {
    fieldErrors.value.endDate = 'Please choose an end date.'
    ok = false
  } else if (startDate.value && endDate.value < startDate.value) {
    fieldErrors.value.endDate = 'End date must be on or after the start date.'
    ok = false
  }
  if (reasonOver.value) {
    fieldErrors.value.reason = `Reason can be at most ${MAX_REASON} characters.`
    ok = false
  }
  return ok
}

interface BackendErrorBody {
  error?: {
    message?: string
    details?: Array<{ field?: string; messages?: string[] }>
  }
}

function applyBackendErrors(body: BackendErrorBody): void {
  const details = body?.error?.details ?? []
  let mapped = false
  for (const detail of details) {
    const field = detail.field
    const message = detail.messages?.[0]
    if (!field || !message) continue
    if (field === 'startDate' || field === 'endDate' || field === 'reason') {
      fieldErrors.value[field] = message
      mapped = true
    }
  }
  if (!mapped) {
    generalError.value =
      body?.error?.message ?? 'Could not submit your request. Please try again.'
  }
}

async function onSubmit() {
  successMessage.value = null
  if (!validate()) return

  submitting.value = true
  try {
    const trimmed = reason.value.trim()
    const created = await submitRequest({
      startDate: startDate.value,
      endDate: endDate.value,
      reason: trimmed ? trimmed : undefined,
    })
    emit('created', created)
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
    successMessage.value = 'Request submitted — pending review.'
    if (successTimer) clearTimeout(successTimer)
    successTimer = setTimeout(() => {
      successMessage.value = null
    }, 4500)
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      applyBackendErrors(err.response.data as BackendErrorBody)
    } else {
      generalError.value =
        'Could not submit your request. Please check your connection and try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section
    class="rounded-2xl border border-alpine-border bg-white shadow-sm"
  >
    <div class="border-b border-alpine-border bg-gradient-to-br from-primary-50/60 to-white px-6 py-5 sm:px-8">
      <h2 class="font-display text-xl font-semibold text-alpine-ink">
        Plan your time off
      </h2>
      <p class="mt-1 text-sm text-alpine-muted">
        Pick your dates and add a brief reason if you'd like.
      </p>
    </div>

    <form class="px-6 py-6 sm:px-8 sm:py-7" novalidate @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            for="startDate"
            class="block text-sm font-medium text-alpine-ink"
          >
            Start date
          </label>
          <input
            id="startDate"
            v-model="startDate"
            type="date"
            :min="today"
            :aria-invalid="!!fieldErrors.startDate"
            aria-describedby="startDate-error"
            :class="[
              'mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-alpine-ink shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1',
              fieldErrors.startDate
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                : 'border-alpine-border focus:border-primary-400 focus:ring-primary-200',
            ]"
          />
          <p
            v-if="fieldErrors.startDate"
            id="startDate-error"
            class="mt-1.5 text-xs text-rose-600"
          >
            {{ fieldErrors.startDate }}
          </p>
        </div>

        <div>
          <label
            for="endDate"
            class="block text-sm font-medium text-alpine-ink"
          >
            End date
          </label>
          <input
            id="endDate"
            v-model="endDate"
            type="date"
            :min="endMin"
            :aria-invalid="!!fieldErrors.endDate"
            aria-describedby="endDate-error"
            :class="[
              'mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-alpine-ink shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1',
              fieldErrors.endDate
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                : 'border-alpine-border focus:border-primary-400 focus:ring-primary-200',
            ]"
          />
          <p
            v-if="fieldErrors.endDate"
            id="endDate-error"
            class="mt-1.5 text-xs text-rose-600"
          >
            {{ fieldErrors.endDate }}
          </p>
        </div>
      </div>

      <div class="mt-5">
        <div class="flex items-baseline justify-between">
          <label
            for="reason"
            class="block text-sm font-medium text-alpine-ink"
          >
            Reason
            <span class="ml-1 text-xs font-normal text-alpine-muted">
              (optional)
            </span>
          </label>
          <span
            :class="[
              'text-xs tabular-nums',
              reasonOver ? 'text-rose-600' : 'text-alpine-muted',
            ]"
          >
            {{ reasonCount }} / {{ MAX_REASON }}
          </span>
        </div>
        <textarea
          id="reason"
          v-model="reason"
          rows="4"
          :maxlength="MAX_REASON"
          placeholder="A few words about your request…"
          :aria-invalid="!!fieldErrors.reason"
          aria-describedby="reason-error"
          :class="[
            'mt-1.5 block w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-alpine-ink shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1',
            fieldErrors.reason
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
              : 'border-alpine-border focus:border-primary-400 focus:ring-primary-200',
          ]"
        ></textarea>
        <p
          v-if="fieldErrors.reason"
          id="reason-error"
          class="mt-1.5 text-xs text-rose-600"
        >
          {{ fieldErrors.reason }}
        </p>
      </div>

      <div
        v-if="generalError"
        class="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        role="alert"
      >
        <svg
          class="mt-0.5 h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
        <span>{{ generalError }}</span>
      </div>

      <div
        v-if="successMessage"
        class="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        role="status"
      >
        <svg
          class="mt-0.5 h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-300"
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
          {{ submitting ? 'Submitting…' : 'Submit request' }}
        </button>
      </div>
    </form>
  </section>
</template>
