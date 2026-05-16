<script setup lang="ts">
import { computed, ref } from 'vue'
import StatusBadge from '../shared/StatusBadge.vue'
import type { VacationRequest } from '../../types'

const props = defineProps<{
  requests: VacationRequest[]
  loading: boolean
  error: string | null
}>()

const TRUNCATE_AT = 140

const expanded = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  const next = new Set(expanded.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expanded.value = next
}

function isExpanded(id: number): boolean {
  return expanded.value.has(id)
}

const sortedRequests = computed(() =>
  [...props.requests].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)

function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function formatRange(start: string, end: string): string {
  const s = parseDateLocal(start)
  const e = parseDateLocal(end)
  const sameYear = s.getFullYear() === e.getFullYear()
  const sameMonth = sameYear && s.getMonth() === e.getMonth()
  const monthDay = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const year = (d: Date) => d.getFullYear()
  if (sameMonth && s.getDate() === e.getDate()) {
    return `${monthDay(s)}, ${year(s)}`
  }
  if (sameYear) {
    return `${monthDay(s)} – ${monthDay(e)}, ${year(e)}`
  }
  return `${monthDay(s)}, ${year(s)} – ${monthDay(e)}, ${year(e)}`
}

function dayCount(start: string, end: string): number {
  const s = parseDateLocal(start)
  const e = parseDateLocal(end)
  const ms = e.getTime() - s.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1
}

function needsTruncate(reason: string | null): boolean {
  return !!reason && reason.length > TRUNCATE_AT
}

function displayedReason(req: VacationRequest): string {
  if (!req.reason) return ''
  if (isExpanded(req.id) || !needsTruncate(req.reason)) return req.reason
  return req.reason.slice(0, TRUNCATE_AT).trimEnd() + '…'
}
</script>

<template>
  <section class="mt-8">
    <div class="mb-4 flex items-baseline justify-between">
      <h2 class="font-display text-xl font-semibold text-alpine-ink">
        Your requests
      </h2>
      <span
        v-if="!loading && !error && requests.length > 0"
        class="text-xs text-alpine-muted"
      >
        {{ requests.length }} total
      </span>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="rounded-2xl border border-alpine-border bg-white px-6 py-10 text-center text-sm text-alpine-muted"
    >
      Loading your requests…
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
      v-else-if="requests.length === 0"
      class="relative overflow-hidden rounded-2xl border border-dashed border-alpine-border bg-white px-6 py-14 text-center sm:py-20"
    >
      <!-- Alpine illustration -->
      <svg
        class="mx-auto h-28 w-44 text-primary-500/85 sm:h-32 sm:w-52"
        viewBox="0 0 220 110"
        fill="none"
        aria-hidden="true"
      >
        <!-- back mountain -->
        <path
          d="M0 100 L60 30 L95 70 L130 35 L175 90 L220 50 L220 110 L0 110 Z"
          fill="currentColor"
          fill-opacity="0.18"
        />
        <!-- front mountain -->
        <path
          d="M0 110 L40 65 L80 95 L115 50 L150 95 L195 75 L220 110 Z"
          fill="currentColor"
          fill-opacity="0.45"
        />
        <!-- front mountain outline -->
        <path
          d="M0 110 L40 65 L80 95 L115 50 L150 95 L195 75 L220 110"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
          stroke-opacity="0.9"
          fill="none"
        />
        <!-- snowcaps -->
        <path
          d="M105 60 L115 50 L125 60 L120 64 L115 60 L110 64 Z"
          fill="white"
        />
        <path
          d="M35 71 L40 65 L45 71 L42 73 L40 70 L38 73 Z"
          fill="white"
        />
        <!-- flag on summit -->
        <line x1="115" y1="50" x2="115" y2="32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path
          d="M115 33 L127 36 L115 41 Z"
          fill="#F43F5E"
        />
        <!-- snowflakes scattered -->
        <g stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.7">
          <g transform="translate(30 25)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
          <g transform="translate(170 20)">
            <line x1="-3" y1="0" x2="3" y2="0" />
            <line x1="0" y1="-3" x2="0" y2="3" />
            <line x1="-2" y1="-2" x2="2" y2="2" />
            <line x1="-2" y1="2" x2="2" y2="-2" />
          </g>
          <g transform="translate(195 45)">
            <line x1="-2.5" y1="0" x2="2.5" y2="0" />
            <line x1="0" y1="-2.5" x2="0" y2="2.5" />
          </g>
          <g transform="translate(60 50)">
            <line x1="-2.5" y1="0" x2="2.5" y2="0" />
            <line x1="0" y1="-2.5" x2="0" y2="2.5" />
          </g>
        </g>
      </svg>

      <h3 class="mt-5 font-display text-xl font-semibold text-alpine-ink sm:text-2xl">
        No trips planned yet
      </h3>
      <p class="mt-2 text-sm text-alpine-muted">
        Fresh tracks ahead — submit your first request above.
      </p>
    </div>

    <!-- List -->
    <TransitionGroup
      v-else
      tag="ul"
      name="request-list"
      class="space-y-3"
    >
      <li
        v-for="req in sortedRequests"
        :key="req.id"
        class="request-list-item rounded-2xl border border-alpine-border bg-white p-5 shadow-sm transition-colors hover:border-primary-200 sm:p-6"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span class="text-base font-semibold text-alpine-ink">
                {{ formatRange(req.startDate, req.endDate) }}
              </span>
              <span class="text-xs font-medium text-alpine-muted">
                {{ dayCount(req.startDate, req.endDate) }}
                {{ dayCount(req.startDate, req.endDate) === 1 ? 'day' : 'days' }}
              </span>
            </div>
          </div>
          <StatusBadge :status="req.status" />
        </div>

        <p
          v-if="req.reason"
          class="mt-3 whitespace-pre-line text-sm text-alpine-ink/90"
        >
          {{ displayedReason(req) }}
          <button
            v-if="needsTruncate(req.reason)"
            type="button"
            class="ml-1 align-baseline text-xs font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:underline"
            @click="toggleExpand(req.id)"
          >
            {{ isExpanded(req.id) ? 'Show less' : 'Show more' }}
          </button>
        </p>
        <p v-else class="mt-3 text-sm italic text-alpine-muted">
          No reason provided.
        </p>

        <div
          v-if="req.comments"
          class="mt-4 rounded-lg border border-alpine-border bg-alpine-surface/60 px-3 py-2.5"
        >
          <p class="text-[11px] font-medium uppercase tracking-wide text-alpine-muted">
            Validator note{{ req.validator ? ` — ${req.validator.name}` : '' }}
          </p>
          <p class="mt-1 text-sm text-alpine-ink/90">{{ req.comments }}</p>
        </div>
      </li>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.request-list-enter-active {
  transition:
    opacity 240ms ease-out,
    transform 240ms ease-out;
}
.request-list-leave-active {
  transition:
    opacity 180ms ease-in,
    transform 180ms ease-in;
  position: absolute;
  width: 100%;
}
.request-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.request-list-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.request-list-move {
  transition: transform 240ms ease-out;
}
</style>
