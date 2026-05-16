<script setup lang="ts">
export interface StatItem {
  key: string
  label: string
  value: number | string
  unit?: string
  hint?: string
  accent?: 'primary' | 'amber' | 'emerald' | 'rose' | 'slate'
}

withDefaults(
  defineProps<{ items: StatItem[] }>(),
  {},
)

const accentMap: Record<NonNullable<StatItem['accent']>, string> = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  slate: 'bg-slate-50 text-slate-700 ring-slate-200',
}

function dotClass(accent: StatItem['accent']): string {
  return accentMap[accent ?? 'slate']
}
</script>

<template>
  <ul
    class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    <li
      v-for="item in items"
      :key="item.key"
      class="rounded-2xl border border-alpine-border bg-white px-5 py-4 shadow-sm transition hover:border-primary-200 sm:px-6 sm:py-5"
    >
      <div class="flex items-start justify-between gap-3">
        <p
          class="text-[11px] font-medium uppercase tracking-[0.14em] text-alpine-muted"
        >
          {{ item.label }}
        </p>
        <span
          v-if="item.accent"
          :class="[
            'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
            dotClass(item.accent),
          ]"
          aria-hidden="true"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      </div>
      <p class="mt-2 flex items-baseline gap-1.5">
        <span class="font-display text-3xl font-semibold tracking-tight text-alpine-ink">
          {{ item.value }}
        </span>
        <span
          v-if="item.unit"
          class="text-sm font-medium text-alpine-muted"
        >
          {{ item.unit }}
        </span>
      </p>
      <p
        v-if="item.hint"
        class="mt-1 text-xs text-alpine-muted"
      >
        {{ item.hint }}
      </p>
    </li>
  </ul>
</template>
