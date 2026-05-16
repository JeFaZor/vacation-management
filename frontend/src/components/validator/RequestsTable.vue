<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '../shared/StatusBadge.vue'
import type { VacationRequest } from '../../types'

const props = defineProps<{
  requests: VacationRequest[]
  loading: boolean
  error: string | null
  filterActive: boolean
  approvingId: number | null
  rejectingId: number | null
}>()

const emit = defineEmits<{
  approve: [VacationRequest]
  reject: [VacationRequest]
}>()

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
  if (s.getTime() === e.getTime()) {
    return `${monthDay(s)}, ${s.getFullYear()}`
  }
  if (sameYear) return `${monthDay(s)} – ${monthDay(e)}, ${e.getFullYear()}`
  return `${monthDay(s)}, ${s.getFullYear()} – ${monthDay(e)}, ${e.getFullYear()}`
}

function dayCount(start: string, end: string): number {
  const s = parseDateLocal(start)
  const e = parseDateLocal(end)
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function dayLabel(start: string, end: string): string {
  const n = dayCount(start, end)
  return `${n} ${n === 1 ? 'day' : 'days'}`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

function isPending(req: VacationRequest): boolean {
  return req.status === 'Pending'
}

function isBusy(id: number): boolean {
  return props.approvingId === id || props.rejectingId === id
}

const sorted = computed(() =>
  [...props.requests].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)

const emptyMessage = computed(() =>
  props.filterActive
    ? 'No requests match this filter.'
    : 'No vacation requests yet.',
)
</script>

<template>
  <section class="mt-4 sm:mt-6">
    <!-- Loading -->
    <div
      v-if="loading"
      class="rounded-2xl border border-alpine-border bg-white px-6 py-10 text-center text-sm text-alpine-muted shadow-sm"
    >
      <span class="inline-flex items-center gap-2">
        <svg
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
        Loading requests…
      </span>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-6 text-sm text-rose-700"
    >
      {{ error }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="sorted.length === 0"
      class="rounded-2xl border border-dashed border-alpine-border bg-white px-6 py-14 text-center"
    >
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <p class="mt-3 text-sm font-medium text-alpine-ink">{{ emptyMessage }}</p>
      <p
        v-if="filterActive"
        class="mt-1 text-xs text-alpine-muted"
      >
        Try a different status above.
      </p>
    </div>

    <template v-else>
      <!-- Desktop table (md+) -->
      <div
        class="hidden overflow-hidden rounded-2xl border border-alpine-border bg-white shadow-sm md:block"
      >
        <table class="min-w-full divide-y divide-alpine-border">
          <thead class="bg-alpine-surface/50">
            <tr>
              <th
                scope="col"
                class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-alpine-muted"
              >
                Requester
              </th>
              <th
                scope="col"
                class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-alpine-muted"
              >
                Dates
              </th>
              <th
                scope="col"
                class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-alpine-muted"
              >
                Days
              </th>
              <th
                scope="col"
                class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-alpine-muted"
              >
                Reason
              </th>
              <th
                scope="col"
                class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-alpine-muted"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-alpine-muted"
              >
                Validator note
              </th>
              <th
                scope="col"
                class="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-alpine-muted"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-alpine-border">
            <tr
              v-for="req in sorted"
              :key="req.id"
              class="bg-white align-top transition hover:bg-alpine-surface/40"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700"
                    aria-hidden="true"
                  >
                    {{ initials(req.user.name) }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-alpine-ink">
                      {{ req.user.name }}
                    </p>
                    <p class="text-[11px] uppercase tracking-wide text-alpine-muted">
                      {{ req.user.role }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-sm text-alpine-ink">
                {{ formatRange(req.startDate, req.endDate) }}
              </td>
              <td class="px-5 py-4 text-sm tabular-nums text-alpine-muted">
                {{ dayLabel(req.startDate, req.endDate) }}
              </td>
              <td class="px-5 py-4 text-sm text-alpine-ink/90">
                <p
                  v-if="req.reason"
                  class="line-clamp-2 max-w-xs"
                  :title="req.reason"
                >
                  {{ req.reason }}
                </p>
                <p v-else class="italic text-alpine-muted">No reason</p>
              </td>
              <td class="px-5 py-4">
                <StatusBadge :status="req.status" size="sm" />
              </td>
              <td class="px-5 py-4 text-sm text-alpine-ink/90">
                <p
                  v-if="req.comments"
                  class="line-clamp-2 max-w-xs"
                  :title="req.comments"
                >
                  {{ req.comments }}
                </p>
                <p v-else class="text-alpine-muted">—</p>
              </td>
              <td class="px-5 py-4">
                <div
                  v-if="isPending(req)"
                  class="flex justify-end gap-2"
                >
                  <button
                    type="button"
                    :disabled="isBusy(req.id)"
                    class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    @click="emit('approve', req)"
                  >
                    <svg
                      v-if="approvingId === req.id"
                      class="h-3.5 w-3.5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <svg
                      v-else
                      class="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.25"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                    Approve
                  </button>
                  <button
                    type="button"
                    :disabled="isBusy(req.id)"
                    class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    @click="emit('reject', req)"
                  >
                    <svg
                      class="h-3.5 w-3.5"
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
                    Reject
                  </button>
                </div>
                <div
                  v-else
                  class="text-right text-xs text-alpine-muted"
                >
                  <template v-if="req.validator">
                    by {{ req.validator.name }}
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile stacked cards -->
      <ul class="space-y-3 md:hidden">
        <li
          v-for="req in sorted"
          :key="req.id"
          class="rounded-2xl border border-alpine-border bg-white p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700"
                aria-hidden="true"
              >
                {{ initials(req.user.name) }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-alpine-ink">
                  {{ req.user.name }}
                </p>
                <p class="text-[11px] uppercase tracking-wide text-alpine-muted">
                  {{ req.user.role }}
                </p>
              </div>
            </div>
            <StatusBadge :status="req.status" size="sm" />
          </div>

          <div class="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span class="text-sm font-medium text-alpine-ink">
              {{ formatRange(req.startDate, req.endDate) }}
            </span>
            <span class="text-xs font-medium text-alpine-muted">
              {{ dayLabel(req.startDate, req.endDate) }}
            </span>
          </div>

          <p
            v-if="req.reason"
            class="mt-2 line-clamp-3 text-sm text-alpine-ink/90"
          >
            {{ req.reason }}
          </p>
          <p
            v-else
            class="mt-2 text-sm italic text-alpine-muted"
          >
            No reason provided.
          </p>

          <div
            v-if="req.comments"
            class="mt-3 rounded-lg border border-alpine-border bg-alpine-surface/60 px-3 py-2"
          >
            <p class="text-[11px] font-medium uppercase tracking-wide text-alpine-muted">
              Validator note{{ req.validator ? ` — ${req.validator.name}` : '' }}
            </p>
            <p class="mt-1 text-sm text-alpine-ink/90">{{ req.comments }}</p>
          </div>

          <div
            v-if="isPending(req)"
            class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              :disabled="isBusy(req.id)"
              class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:w-auto"
              @click="emit('approve', req)"
            >
              <svg
                v-if="approvingId === req.id"
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
              <svg
                v-else
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.25"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
              Approve
            </button>
            <button
              type="button"
              :disabled="isBusy(req.id)"
              class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              @click="emit('reject', req)"
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
              Reject
            </button>
          </div>
          <p
            v-else-if="req.validator"
            class="mt-3 text-xs text-alpine-muted"
          >
            Decision by {{ req.validator.name }}
          </p>
        </li>
      </ul>
    </template>
  </section>
</template>
