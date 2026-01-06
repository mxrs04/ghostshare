import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  // WICHTIG: Hier muss import.meta.env.BASE_URL stehen!
  // Das sorgt dafür, dass der Router "/ghostshare/" als Startpunkt nimmt.
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    }
  ],
})

export default router
