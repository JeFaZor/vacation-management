import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'user-picker',
    component: () => import('../views/UserPickerView.vue'),
    meta: { public: true },
  },
  {
    path: '/my-requests',
    name: 'my-requests',
    component: () => import('../views/RequesterView.vue'),
    meta: { role: 'Requester' as const },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/ValidatorView.vue'),
    meta: { role: 'Validator' as const },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function homeForRole(role: 'Requester' | 'Validator') {
  return role === 'Requester' ? '/my-requests' : '/dashboard'
}

router.beforeEach((to) => {
  const userStore = useUserStore()
  const user = userStore.currentUser

  if (!user) {
    if (to.path !== '/') return '/'
    return true
  }

  if (to.path === '/') {
    return homeForRole(user.role)
  }

  const requiredRole = to.meta.role as 'Requester' | 'Validator' | undefined
  if (requiredRole && requiredRole !== user.role) {
    return homeForRole(user.role)
  }

  return true
})

export default router
