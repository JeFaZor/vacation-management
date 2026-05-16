<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import BrandMark from '../shared/BrandMark.vue'

const userStore = useUserStore()
const router = useRouter()

const roleBadge = computed(() => {
  const role = userStore.currentUser?.role
  if (role === 'Validator') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }
  return 'bg-primary-50 text-primary-700 ring-primary-200'
})

function switchUser() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-alpine-border bg-white/85 backdrop-blur"
  >
    <div
      class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4"
    >
      <!-- Brand -->
      <BrandMark size="md" :show-wordmark="true" class="min-w-0" />

      <!-- User -->
      <div v-if="userStore.currentUser" class="flex min-w-0 items-center gap-2 sm:gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <span class="truncate text-sm font-medium text-alpine-ink">
            {{ userStore.currentUser.name }}
          </span>
          <span
            :class="[
              'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset',
              roleBadge,
            ]"
          >
            {{ userStore.currentUser.role }}
          </span>
        </div>
        <button
          type="button"
          class="shrink-0 whitespace-nowrap rounded-lg border border-alpine-border bg-white px-3 py-1.5 text-xs font-medium text-alpine-ink shadow-sm transition hover:bg-alpine-surface hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:text-sm"
          @click="switchUser"
        >
          <span class="sm:hidden">Switch</span>
          <span class="hidden sm:inline">Switch User</span>
        </button>
      </div>
    </div>
  </header>
</template>
