<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'dark' | 'light'
    size?: 'sm' | 'md' | 'lg'
    showWordmark?: boolean
  }>(),
  { variant: 'dark', size: 'md', showWordmark: true },
)
</script>

<template>
  <div class="inline-flex items-center gap-2.5">
    <!-- Icon: stylized mountain peak with snowcap -->
    <span
      :class="[
        'flex shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-inset',
        variant === 'dark'
          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white ring-primary-700/30'
          : 'bg-white/15 text-white ring-white/25 backdrop-blur',
        size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9',
      ]"
      aria-hidden="true"
    >
      <svg
        :class="
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
        "
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <!-- back peak -->
        <path d="M3 19 L9 9 L13 14" stroke-opacity="0.55" />
        <!-- front peak -->
        <path d="M7 19 L13 8 L21 19 Z" fill="currentColor" fill-opacity="0.18" />
        <!-- snowcap -->
        <path d="M11.2 11 L13 8 L14.8 11 L13.6 11.6 L13 10.5 L12.4 11.6 Z" fill="currentColor" />
      </svg>
    </span>

    <!-- Wordmark -->
    <span
      v-if="showWordmark"
      :class="[
        'font-display font-semibold tracking-tight',
        variant === 'dark' ? 'text-alpine-ink' : 'text-white',
        size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg',
      ]"
    >
      Travelski
      <span
        :class="[
          'font-sans font-medium tracking-wide',
          variant === 'dark' ? 'text-alpine-muted' : 'text-white/70',
          size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]',
          'ml-1 hidden align-middle uppercase sm:inline',
        ]"
      >
        · Time off
      </span>
    </span>
  </div>
</template>
