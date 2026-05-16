<script setup lang="ts">
import { computed } from 'vue'
import type { Status } from '../../types'

const props = withDefaults(
  defineProps<{ status: Status; size?: 'sm' | 'md' }>(),
  { size: 'md' },
)

const palette = computed(() => {
  switch (props.status) {
    case 'Pending':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 ring-rose-200'
  }
})

const sizeClass = computed(() =>
  props.size === 'sm'
    ? 'gap-1 px-2 py-0.5 text-[11px]'
    : 'gap-1.5 px-2.5 py-1 text-xs',
)

const iconClass = computed(() =>
  props.size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium uppercase tracking-wide ring-1 ring-inset',
      palette,
      sizeClass,
    ]"
  >
    <!-- Pending: hourglass -->
    <svg
      v-if="status === 'Pending'"
      :class="iconClass"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path
        d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"
      />
      <path
        d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"
      />
    </svg>

    <!-- Approved: snowflake (alpine accent) -->
    <svg
      v-else-if="status === 'Approved'"
      :class="iconClass"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <path d="m4.93 4.93 14.14 14.14" />
      <path d="m19.07 4.93-14.14 14.14" />
      <path d="M8 4l4 2 4-2" />
      <path d="M8 20l4-2 4 2" />
      <path d="M4 8l2 4-2 4" />
      <path d="M20 8l-2 4 2 4" />
    </svg>

    <!-- Rejected: x-circle -->
    <svg
      v-else
      :class="iconClass"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
    {{ status }}
  </span>
</template>
