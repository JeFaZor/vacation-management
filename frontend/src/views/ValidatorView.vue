<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import AppLayout from '../components/layout/AppLayout.vue'
import StatusFilter, {
  type StatusFilterValue,
} from '../components/validator/StatusFilter.vue'
import RequestsTable from '../components/validator/RequestsTable.vue'
import RejectDialog from '../components/validator/RejectDialog.vue'
import {
  approveRequest,
  fetchAllRequests,
  rejectRequest,
} from '../services/api'
import { useToastStore } from '../stores/toast'
import { useUserStore } from '../stores/user'
import type { VacationRequest } from '../types'

const userStore = useUserStore()
const toastStore = useToastStore()

const requests = ref<VacationRequest[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const activeFilter = ref<StatusFilterValue>('All')

const approvingId = ref<number | null>(null)
const rejectingId = ref<number | null>(null)

const rejectTarget = ref<VacationRequest | null>(null)
const rejectOpen = ref(false)
const rejectSubmitting = ref(false)

function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.error?.message
    if (typeof message === 'string' && message.length > 0) return message
  }
  return fallback
}

async function load() {
  loading.value = true
  error.value = null
  try {
    requests.value = await fetchAllRequests()
  } catch (err) {
    error.value = extractError(
      err,
      'Could not load the requests. Please try again.',
    )
  } finally {
    loading.value = false
  }
}

onMounted(load)

const counts = computed<Record<StatusFilterValue, number>>(() => {
  let pending = 0
  let approved = 0
  let rejected = 0
  for (const r of requests.value) {
    if (r.status === 'Pending') pending++
    else if (r.status === 'Approved') approved++
    else if (r.status === 'Rejected') rejected++
  }
  return {
    All: requests.value.length,
    Pending: pending,
    Approved: approved,
    Rejected: rejected,
  }
})

const visibleRequests = computed(() => {
  if (activeFilter.value === 'All') return requests.value
  return requests.value.filter((r) => r.status === activeFilter.value)
})

function replaceRequest(updated: VacationRequest) {
  const idx = requests.value.findIndex((r) => r.id === updated.id)
  if (idx >= 0) {
    const next = [...requests.value]
    next[idx] = updated
    requests.value = next
  }
}

async function onApprove(req: VacationRequest) {
  if (approvingId.value !== null || rejectingId.value !== null) return
  approvingId.value = req.id
  try {
    const updated = await approveRequest(req.id)
    replaceRequest(updated)
    toastStore.success(`Approved ${req.user.name}'s request.`)
  } catch (err) {
    toastStore.error(
      extractError(err, 'Could not approve this request. Please try again.'),
    )
  } finally {
    approvingId.value = null
  }
}

function openReject(req: VacationRequest) {
  if (approvingId.value !== null) return
  rejectTarget.value = req
  rejectOpen.value = true
}

function closeReject() {
  if (rejectSubmitting.value) return
  rejectOpen.value = false
  rejectTarget.value = null
}

async function onConfirmReject(comments: string) {
  const target = rejectTarget.value
  if (!target) return
  rejectSubmitting.value = true
  rejectingId.value = target.id
  try {
    const updated = await rejectRequest(target.id, comments)
    replaceRequest(updated)
    rejectOpen.value = false
    rejectTarget.value = null
    toastStore.success(`Rejected ${target.user.name}'s request.`)
  } catch (err) {
    toastStore.error(
      extractError(err, 'Could not reject this request. Please try again.'),
    )
  } finally {
    rejectSubmitting.value = false
    rejectingId.value = null
  }
}

const pendingCount = computed(() => counts.value.Pending)

const subtitle = computed(() => {
  const name = userStore.currentUser?.name ?? 'team'
  const n = pendingCount.value
  if (n === 0) {
    return `Hi ${name} — the queue is empty. Use the filters below to revisit past decisions.`
  }
  const noun = n === 1 ? 'request' : 'requests'
  return `Hi ${name} — ${n} ${noun} ${n === 1 ? 'is' : 'are'} awaiting your decision. Approve or reject from the table below.`
})
</script>

<template>
  <AppLayout>
    <header class="mb-6 sm:mb-8">
      <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary-700">
        Validator
      </p>
      <h1
        class="mt-1 font-display text-3xl font-semibold tracking-tight text-alpine-ink sm:text-4xl"
      >
        All vacation requests
      </h1>
      <p class="mt-2 max-w-2xl text-sm text-alpine-muted">
        {{ subtitle }}
      </p>
    </header>

    <div class="mb-4 sm:mb-5">
      <StatusFilter v-model="activeFilter" :counts="counts" />
    </div>

    <RequestsTable
      :requests="visibleRequests"
      :loading="loading"
      :error="error"
      :filter-active="activeFilter !== 'All'"
      :approving-id="approvingId"
      :rejecting-id="rejectingId"
      @approve="onApprove"
      @reject="openReject"
    />

    <RejectDialog
      :open="rejectOpen"
      :request="rejectTarget"
      :submitting="rejectSubmitting"
      @cancel="closeReject"
      @confirm="onConfirmReject"
    />
  </AppLayout>
</template>
