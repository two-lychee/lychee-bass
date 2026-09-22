import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/practice/PracticeFoundationView.vue'),
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('../views/bass-simulator/bass-simulator.vue'),
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('../views/ProgressView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      redirect: { name: 'home' },
    },
    {
      path: '/theory',
      name: 'theory',
      component: () => import('../views/TheoryView.vue'),
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/PracticeView.vue'),
      redirect: { name: 'home' },
      children: [
        {
          path: 'training/:exerciseId',
          name: 'practice-training',
          component: () => import('../views/practice/PracticeTrainingView.vue'),
        },
        {
          path: 'library',
          name: 'practice-library',
          component: () => import('../views/practice/PracticeLibraryView.vue'),
        },
        {
          path: 'lesson',
          name: 'practice-lesson',
          component: () => import('../views/practice/PracticeLessonView.vue'),
        },
        {
          path: 'metronome',
          name: 'practice-metronome',
          component: () => import('../views/practice/PracticeMetronomeView.vue'),
        },
        {
          path: 'fretboard',
          name: 'practice-fretboard',
          component: () => import('../views/practice/PracticeFretboardView.vue'),
        },
      ],
    },
  ],
})

export default router
