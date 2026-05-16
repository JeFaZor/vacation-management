<script setup lang="ts">
import { computed } from 'vue'
import type { Status } from '../../types'

export type StatusFilterValue = 'All' | Status

const props = defineProps<{
  modelValue: StatusFilterValue
  counts: Record<StatusFilterValue, number>
}>()

const emit = defineEmits<{ 'update:modelValue': [StatusFilterValue] }>()

interface Tab {
  value: StatusFilterValue
  label: string
}

const tabs: Tab[] = [
  { value: 'All', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
]

function isActive(value: StatusFilterValue): boolean {
  return props.modelValue === value
}

function pillClass(value: StatusFilterValue): string {
  if (isActive(value)) {
    return 'bg-primary-50 text-primary-700 ring-primary-200 shadow-sm'
  }
  return 'bg-transparent text-alpine-muted ring-transparent hover:bg-alpine-surface/70 hover:text-alpine-ink'
}

function countClass(value: StatusFilterValue): string {
  if (isActive(value)) {
    return 'bg-white text-primary-700 ring-primary-200'
  }
  switch (value) {
    case 'Pending':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 ring-rose-200'
    default:
      return 'bg-alpine-surface text-alpine-muted ring-alpine-border'
  }
}

function select(value: StatusFilterValue) {
  if (props.modelValue !== value) emit('update:modelValue', value)
}

const total = computed(() => props.counts.All)
</script>

<template>
  <div
    role="tablist"
    aria-label="Filter requests by status"
    class="inline-flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-alpine-border bg-white p-1 shadow-sm sm:w-auto"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      role="tab"
      type="button"
      :aria-selected="isActive(tab.value)"
      :class="[
        'group inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:px-3.5 sm:py-2',
        pillClass(tab.value),
      ]"
      @click="select(tab.value)"
    >
      <span>{{ tab.label }}</span>
      <span
        :class="[
          'inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-inset transition',
          countClass(tab.value),
        ]"
        :aria-label="`${counts[tab.value]} ${tab.label.toLowerCase()}`"
      >
        {{ counts[tab.value] }}
      </span>
    </button>
    <span class="sr-only">Total {{ total }} requests</span>
  </div>
</template>
