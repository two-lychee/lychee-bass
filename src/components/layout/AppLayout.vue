<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: '学习', icon: 'i-lucide-music', to: '/' },
  { label: '练习', icon: 'i-lucide-presentation', to: '/practice' },
  { label: '乐理', icon: 'i-lucide-book-open', to: '/theory' },
  { label: '进度', icon: 'i-lucide-chart-no-axes-column', to: '/progress' },
  { label: '关于', icon: 'i-lucide-info', to: '/about' },
]

// 练习页需要宽屏（指板/谱面），取消容器最大宽度限制
const isWide = computed(() => route.path.startsWith('/practice'))
</script>

<template>
  <div class="flex min-h-screen flex-col bg-default text-default">
    <UHeader>
      <template #left>
        <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-highlighted">
          <UIcon name="i-lucide-guitar" class="size-6 shrink-0 text-primary" />
          <span>Lychee Bass</span>
        </router-link>
      </template>

      <UNavigationMenu :items="navItems" />

      <template #right>
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu :items="navItems" orientation="vertical" class="w-full" />
      </template>
    </UHeader>

    <main class="w-full flex-1 py-6 sm:py-8">
      <UContainer :class="{ '[--ui-container:none]': isWide }">
        <slot />
      </UContainer>
    </main>
  </div>
</template>
