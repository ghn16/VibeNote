import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Routes publiques (IMPORTANT : mettre AVANT /:link)
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/pages/Landing.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/pages/Signup.vue')
  },

  // Routes authentifiées
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/pages/Messages.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/pages/Analytics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-link',
    name: 'MyLink',
    component: () => import('@/pages/MyLink.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/pages/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
  path: '/analytics',
  name: 'Analytics',
  component: () => import('@/pages/Analytics.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/u/:username/replies',
  name: 'PublicReplies',
  component: () => import('@/pages/PublicReplies.vue')
},

  // Routes spéciales publiques
  {
    path: '/u/:username/replies',
    name: 'PublicReplies',
    component: () => import('@/pages/PublicReplies.vue')
  },

  // Route catch-all pour les profils publics (DOIT être EN DERNIER)
  {
    path: '/:link',
    name: 'PublicProfile',
    component: () => import('@/pages/PublicProfile.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Protection des routes
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Attendre l'initialisation
  if (auth.loading) {
    await auth.init()
  }

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !auth.user) {
    next('/login')
  }
  // Vérifier si la route nécessite le rôle admin
  else if (to.meta.requiresAdmin && auth.user?.profile?.role !== 'admin') {
    next('/dashboard')
  }
  // Rediriger vers dashboard si déjà connecté et on va sur login/signup
  else if ((to.path === '/login' || to.path === '/signup') && auth.user) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router
