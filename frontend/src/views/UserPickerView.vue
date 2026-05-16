<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Role, User } from '../types'
import { fetchUsers } from '../services/api'
import { useUserStore } from '../stores/user'
import BrandMark from '../components/shared/BrandMark.vue'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    users.value = await fetchUsers()
  } catch {
    error.value = 'Could not load profiles. Is the backend running on port 3000?'
  } finally {
    loading.value = false
  }
})

const requesters = computed(() =>
  users.value.filter((u) => u.role === 'Requester'),
)
const validators = computed(() =>
  users.value.filter((u) => u.role === 'Validator'),
)

function pick(user: User) {
  userStore.login(user)
  router.push(user.role === 'Requester' ? '/my-requests' : '/dashboard')
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

function roleAccent(role: Role): string {
  return role === 'Requester'
    ? 'bg-primary-50 text-primary-700 ring-primary-100'
    : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
}

function avatarAccent(role: Role): string {
  return role === 'Requester'
    ? 'bg-primary-100 text-primary-700'
    : 'bg-emerald-100 text-emerald-700'
}
</script>

<template>
  <main class="min-h-screen bg-alpine-bg lg:grid lg:grid-cols-2">
    <!-- Left: brand hero with alpine illustration -->
    <aside
      class="relative isolate hidden overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-500 lg:flex lg:flex-col lg:justify-between"
    >
      <!-- decorative snowflakes -->
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full text-white/15"
        viewBox="0 0 600 800"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <g transform="translate(80 90)">
            <line x1="-12" y1="0" x2="12" y2="0" />
            <line x1="0" y1="-12" x2="0" y2="12" />
            <line x1="-9" y1="-9" x2="9" y2="9" />
            <line x1="-9" y1="9" x2="9" y2="-9" />
          </g>
          <g transform="translate(520 140)">
            <line x1="-8" y1="0" x2="8" y2="0" />
            <line x1="0" y1="-8" x2="0" y2="8" />
            <line x1="-6" y1="-6" x2="6" y2="6" />
            <line x1="-6" y1="6" x2="6" y2="-6" />
          </g>
          <g transform="translate(440 320)">
            <line x1="-6" y1="0" x2="6" y2="0" />
            <line x1="0" y1="-6" x2="0" y2="6" />
          </g>
          <g transform="translate(120 280)">
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-5" x2="0" y2="5" />
            <line x1="-4" y1="-4" x2="4" y2="4" />
            <line x1="-4" y1="4" x2="4" y2="-4" />
          </g>
          <g transform="translate(300 60)">
            <line x1="-7" y1="0" x2="7" y2="0" />
            <line x1="0" y1="-7" x2="0" y2="7" />
          </g>
          <g transform="translate(550 460)">
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-5" x2="0" y2="5" />
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" />
            <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" />
          </g>
        </g>
      </svg>

      <!-- mountain silhouette at the bottom -->
      <svg
        class="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] w-full"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        aria-hidden="true"
      >
        <!-- distant ridge -->
        <path
          d="M0 360 L120 220 L220 300 L340 180 L460 290 L580 200 L700 280 L800 240 L800 500 L0 500 Z"
          fill="white"
          fill-opacity="0.08"
        />
        <!-- mid ridge -->
        <path
          d="M0 420 L100 320 L200 380 L320 270 L440 360 L560 290 L680 360 L800 320 L800 500 L0 500 Z"
          fill="white"
          fill-opacity="0.15"
        />
        <!-- foreground peaks -->
        <path
          d="M0 500 L80 380 L180 460 L280 320 L380 460 L500 350 L620 470 L740 400 L800 460 L800 500 Z"
          fill="white"
          fill-opacity="0.28"
        />
        <!-- snowcaps on the tallest peaks -->
        <path
          d="M268 332 L280 320 L292 332 L286 336 L280 330 L274 336 Z"
          fill="white"
        />
        <path
          d="M488 362 L500 350 L512 362 L506 366 L500 360 L494 366 Z"
          fill="white"
        />
      </svg>

      <!-- brand mark top -->
      <div class="relative z-10 px-10 pt-10 xl:px-14 xl:pt-12">
        <BrandMark variant="light" size="lg" />
      </div>

      <!-- copy block -->
      <div class="relative z-10 px-10 pb-12 xl:px-14 xl:pb-16">
        <p
          class="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-100/90"
        >
          Internal · Vacation Management
        </p>
        <h1
          class="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl"
        >
          Time off,<br />made simple.
        </h1>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-primary-100/90 xl:text-base">
          Submit your trip, watch it move through review, and head for the
          fresh tracks waiting on the other side.
        </p>
      </div>
    </aside>

    <!-- Right: picker -->
    <section class="flex min-h-screen flex-col px-5 py-8 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
      <!-- mobile brand -->
      <div class="mb-8 lg:hidden">
        <BrandMark variant="dark" size="md" />
      </div>

      <div class="mx-auto w-full max-w-lg flex-1">
        <p
          class="text-[11px] font-medium uppercase tracking-[0.22em] text-primary-700"
        >
          Sign in
        </p>
        <h2
          class="mt-2 font-display text-3xl font-semibold tracking-tight text-alpine-ink sm:text-4xl"
        >
          Pick a profile to continue
        </h2>
        <p class="mt-2 text-sm text-alpine-muted">
          Requesters submit their own time off. Validators review and decide.
        </p>

        <div class="mt-8">
          <p
            v-if="loading"
            class="rounded-xl border border-alpine-border bg-white px-5 py-4 text-sm text-alpine-muted"
          >
            Loading profiles…
          </p>
          <p
            v-else-if="error"
            class="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
          >
            {{ error }}
          </p>

          <div v-else class="space-y-8">
            <div
              v-for="group in [
                {
                  role: 'Requester' as Role,
                  label: 'Requesters',
                  users: requesters,
                  hint: 'Submit and track your own time off.',
                },
                {
                  role: 'Validator' as Role,
                  label: 'Validators',
                  users: validators,
                  hint: 'Review and decide on submitted requests.',
                },
              ]"
              :key="group.role"
            >
              <div class="mb-3 flex items-baseline justify-between gap-3">
                <h3 class="font-display text-base font-semibold text-alpine-ink">
                  {{ group.label }}
                </h3>
                <p class="text-xs text-alpine-muted">
                  {{ group.hint }}
                </p>
              </div>

              <ul class="space-y-2.5">
                <li v-for="u in group.users" :key="u.id">
                  <button
                    type="button"
                    class="group flex w-full items-center gap-4 rounded-xl border border-alpine-border bg-white px-4 py-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-alpine-bg sm:px-5"
                    @click="pick(u)"
                  >
                    <span
                      :class="[
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition group-hover:scale-105',
                        avatarAccent(u.role),
                      ]"
                    >
                      {{ initials(u.name) }}
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-base font-medium text-alpine-ink">
                        {{ u.name }}
                      </span>
                      <span
                        :class="[
                          'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset',
                          roleAccent(u.role),
                        ]"
                      >
                        {{ u.role }}
                      </span>
                    </span>
                    <svg
                      class="h-5 w-5 text-alpine-border transition group-hover:translate-x-0.5 group-hover:text-primary-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer class="mx-auto mt-8 w-full max-w-lg text-xs text-alpine-muted">
        Mock authentication — no password required. Switch profiles anytime
        from the header.
      </footer>
    </section>
  </main>
</template>
