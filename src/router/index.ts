import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ─── JWT helpers ─────────────────────────────────────────────────────────────
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function isTokenExpired(token: string) {
  const payload = parseJwt(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 > payload.exp
}

function roleDashboard(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'waiters') return '/waiters'
  return '/'
}

const routes: RouteRecordRaw[] = [
  // ── Guest-only ────────────────────────────────────────────────────────────
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register-detail',
    name: 'regisdetail',
    component: () => import('@/views/auth/RegisterDetailPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot',
    component: () => import('@/views/auth/ForgotPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/verify-otp',
    name: 'verify-otp',
    component: () => import('@/views/auth/VerifyOTPPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordPage.vue'),
    meta: { guestOnly: true }
  },

  // ── Waiters ───────────────────────────────────────────────────────────────
  {
    path: '/waiters',
    name: 'waiters',
    component: () => import('@/views/waiters/ActionHubPage.vue'),
    meta: { requiresAuth: true, role: 'waiters' }
  },
  {
    path: '/waiters/menu/:tableCode?',
    name: 'waiters-menu',
    component: () => import('@/views/waiters/order/MenuPage.vue'),
    meta: { requiresAuth: true, role: 'waiters' }
  },
  {
    path: '/waiters/table',
    name: 'waiters-table',
    component: () => import('@/views/waiters/order/TablePage.vue'),
    meta: { requiresAuth: true, role: 'waiters' }
  },
  {
    path: '/waiters/ongoing-order',
    name: 'waiters-ongoing-order',
    component: () => import('@/views/waiters/order/OngoingOrderPage.vue'),
    meta: { requiresAuth: true, role: 'waiters' }
  },
  {
    path: '/waiters/payment',
    name: 'waiters-sum-payment',
    component: () => import('@/views/waiters/order/PaymentPage.vue'),
    meta: { requiresAuth: true, role: 'waiters' }
  },
  {
    path: '/waiters/payment-detail/:id',
    name: 'waiters-payment-detail',
    component: () => import('@/views/waiters/order/SumNPaymentPage.vue'),
    meta: { requiresAuth: true, role: 'waiters' }
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/DashboardPage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/order-history',
    name: 'admin-order-history',
    component: () => import('@/views/admin/OrderHistoryPage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/manage-menu',
    name: 'admin-manage-menu',
    component: () => import('@/views/admin/ManageMenuPage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/manage-staff',
    name: 'admin-manage-staff',
    component: () => import('@/views/admin/ManageStaffPage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/manage-table',
    name: 'admin-manage-table',
    component: () => import('@/views/admin/ManageTablePage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/manage-category',
    name: 'admin-manage-category',
    component: () => import('@/views/admin/ManageCategoryPage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/stock-history',
    name: 'admin-stock-history',
    component: () => import('@/views/admin/StockHistoryPage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ─── Navigation Guard ─────────────────────────────────────────────────────────
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const token = auth.token

  if (token && isTokenExpired(token)) {
    auth.$patch({ token: null, profile: null, token_reset: null })
    localStorage.removeItem('token')
    localStorage.removeItem('profile')
    localStorage.removeItem('token_reset')
    return next({ path: '/', query: { reason: 'expired' } })
  }

  const loggedIn = !!token
  const userRole = auth.profile?.role

  if (to.meta.guestOnly && loggedIn) {
    return next(roleDashboard(userRole))
  }

  if (to.meta.requiresAuth && !loggedIn) {
    return next({ path: '/', query: { redirect: to.fullPath } })
  }

  if (to.meta.role && userRole !== to.meta.role) {
    return next(roleDashboard(userRole))
  }

  next()
})

export default router
