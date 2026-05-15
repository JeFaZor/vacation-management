<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const router = useRouter()

function switchUser() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-alpine-border bg-white/90 backdrop-blur"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
      <div class="text-lg font-semibold text-primary">Vacation Management</div>
      <div v-if="userStore.currentUser" class="flex items-center gap-3">
        <span class="text-sm text-alpine-ink">
          {{ userStore.currentUser.name }}
          <span class="ml-1 rounded-full bg-alpine-surface px-2 py-0.5 text-xs text-alpine-muted">
            {{ userStore.currentUser.role }}
          </span>
        </span>
        <button
          type="button"
          class="rounded-md border border-alpine-border bg-white px-3 py-1.5 text-sm text-alpine-ink hover:bg-alpine-surface"
          @click="switchUser"
        >
          Switch User
        </button>
      </div>
    </div>
  </header>
</template>
