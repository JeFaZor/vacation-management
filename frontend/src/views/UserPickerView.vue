<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '../types'
import { fetchUsers } from '../services/api'
import { useUserStore } from '../stores/user'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
})

function pick(user: User) {
  userStore.login(user)
  router.push(user.role === 'Requester' ? '/my-requests' : '/dashboard')
}
</script>

<template>
  <main class="min-h-screen bg-alpine-bg p-8">
    <div class="mx-auto max-w-3xl">
      <h1 class="text-3xl font-semibold text-alpine-ink">UserPickerView</h1>
      <p class="mt-2 text-alpine-muted">Select a user to sign in.</p>

      <p v-if="loading" class="mt-6 text-alpine-muted">Loading users…</p>
      <p v-else-if="error" class="mt-6 text-status-rejected">{{ error }}</p>

      <ul v-else class="mt-6 space-y-2">
        <li v-for="u in users" :key="u.id">
          <button
            type="button"
            class="w-full rounded-lg bg-primary px-4 py-3 text-left text-white hover:bg-primary-700"
            @click="pick(u)"
          >
            {{ u.name }} <span class="text-primary-100">({{ u.role }})</span>
          </button>
        </li>
      </ul>
    </div>
  </main>
</template>
