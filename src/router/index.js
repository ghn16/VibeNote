import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // =====================================================
  // ROUTES PUBLIQUES (AVANT TOUT)
  // =====================================================
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

  // =====================================================
  // ROUTES AUTHENTIFIÉES
  // =====================================================
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
    path: '/my-link',
    name: 'MyLink',
    component: () => import('@/pages/MyLink.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/pages/Analytics.vue'),
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

  // =====================================================
  // ROUTE PROFIL PUBLIC (Réponses publiques)
  // =====================================================
  {
    path: '/public-replies',
    name: 'PublicReplies',
    component: () => import('@/pages/PublicReplies.vue'),
    meta: { requiresAuth: true }
  },

  // =====================================================
  // ROUTE CATCH-ALL POUR PROFILS PUBLICS
  // DOIT ÊTRE EN DERNIER !
  // =====================================================
  {
    path: '/:link',
    name: 'PublicProfile',
    component: () => import('@/pages/PublicProfile.vue'),
    // Éviter de matcher les routes système
    beforeEnter: (to, from, next) => {
      const systemRoutes = [
        'login', 'signup', 'dashboard', 'messages',
        'my-link', 'analytics', 'settings', 'admin',
        'public-replies'
      ]

      if (systemRoutes.includes(to.params.link)) {
        next('/404')
      } else {
        next()
      }
    }
  },

  // =====================================================
  // ROUTE 404 (Optionnelle)
  // =====================================================
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/pages/Landing.vue') // ou créer une vraie page 404
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// =====================================================
// PROTECTION DES ROUTES
// =====================================================
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
