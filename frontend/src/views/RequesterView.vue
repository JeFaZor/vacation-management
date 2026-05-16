<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import AppLayout from '../components/layout/AppLayout.vue'
import RequestForm from '../components/requester/RequestForm.vue'
import MyRequestsList from '../components/requester/MyRequestsList.vue'
import StatStrip, { type StatItem } from '../components/shared/StatStrip.vue'
import { fetchMyRequests } from '../services/api'
import { useUserStore } from '../stores/user'
import type { VacationRequest } from '../types'

const userStore = useUserStore()
const requests = ref<VacationRequest[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    requests.value = await fetchMyRequests()
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
      error.value = err.response.data.error.message
    } else {
      error.value = 'Could not load your requests. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function onCreated(req: VacationRequest) {
  requests.value = [req, ...requests.value]
}

onMounted(load)

function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function dayCount(start: string, end: string): number {
  const s = parseDateLocal(start)
  const e = parseDateLocal(end)
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const currentYear = new Date().getFullYear()

const stats = computed<StatItem[]>(() => {
  const thisYear = requests.value.filter(
    (r) => parseDateLocal(r.startDate).getFullYear() === currentYear,
  )
  const approvedDays = thisYear
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + dayCount(r.startDate, r.endDate), 0)
  const pendingCount = requests.value.filter((r) => r.status === 'Pending').length
  const rejectedCount = requests.value.filter((r) => r.status === 'Rejected').length

  return [
    {
      key: 'approved',
      label: `Approved in ${currentYear}`,
      value: approvedDays,
      unit: approvedDays === 1 ? 'day' : 'days',
      hint: 'Time off you can count on.',
      accent: 'emerald',
    },
    {
      key: 'pending',
      label: 'Awaiting review',
      value: pendingCount,
      unit: pendingCount === 1 ? 'request' : 'requests',
      hint: 'Still in the queue.',
      accent: 'amber',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      value: rejectedCount,
      unit: rejectedCount === 1 ? 'request' : 'requests',
      hint: 'Look for the validator note.',
      accent: 'rose',
    },
  ]
})
</script>

<template>
  <AppLayout>
    <header class="mb-6 sm:mb-8">
      <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary-700">
        Requester
      </p>
      <h1 class="mt-1 font-display text-3xl font-semibold tracking-tight text-alpine-ink sm:text-4xl">
        My vacation requests
      </h1>
      <p class="mt-2 max-w-2xl text-sm text-alpine-muted">
        Hi {{ userStore.currentUser?.name }} — submit a new request below and
        keep an eye on the status of the ones you've already sent.
      </p>
    </header>

    <StatStrip :items="stats" class="mb-6 sm:mb-8" />

    <RequestForm @created="onCreated" />
    <MyRequestsList :requests="requests" :loading="loading" :error="error" />
  </AppLayout>
</template>
