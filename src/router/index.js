import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Journal from '../views/Journal.vue'
import MoodTracker from '../views/MoodTracker.vue'
import Resources from '../views/Resources.vue'
import Exercises from '../views/Exercises.vue'
import Profile from '../views/Profile.vue'
import LoginView from '../views/Auth/LoginView.vue'
import RegisterView from '../views/Auth/RegisterView.vue'
import { auth } from '../firebase'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/journal',
    name: 'Journal',
    component: Journal,
    meta: { requiresAuth: true },
  },
  {
    path: '/mood-tracker',
    name: 'MoodTracker',
    component: MoodTracker,
    meta: { requiresAuth: true },
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
    meta: { requiresAuth: true },
  },
  {
    path: '/exercises',
    name: 'Exercises',
    component: Exercises,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true },
  },
  {
    path: '/rage-room',
    name: 'RageRoom',
    component: () => import('@/components/RageRoom/RageRoom.vue'),
    meta: { title: 'Rage Room' },
  },
  {
    path: '/emotionsculpture',
    name: 'Sculpture',
    component: () => import('@/components/EmotionSculpture.vue'),
    meta: { title: 'Sculpture' },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
