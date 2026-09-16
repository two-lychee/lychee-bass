<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const modules = [
  {
    name: 'practice-library',
    label: '练习库',
    description: '选择今天要练的内容',
    icon: '▦',
  },
  {
    name: 'practice-lesson',
    label: '谱子练习',
    description: '节奏、Tab 与指板同步',
    icon: '♫',
  },
  {
    name: 'practice-metronome',
    label: '节拍器',
    description: '独立练节拍与律动',
    icon: '◷',
  },
]
</script>

<template>
  <div class="practice-shell">
    <header class="practice-topbar">
      <div>
        <p class="eyebrow">练习空间</p>
        <h1>今天练什么？</h1>
      </div>
      <span class="route-state">{{ modules.find((item) => item.name === route.name)?.label }}</span>
    </header>

    <nav class="module-nav" aria-label="练习模块">
      <RouterLink
        v-for="item in modules"
        :key="item.name"
        :to="{ name: item.name }"
        class="module-link"
        :class="{ active: route.name === item.name }"
      >
        <span class="module-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="module-copy">
          <strong>{{ item.label }}</strong>
          <small>{{ item.description }}</small>
        </span>
      </RouterLink>
    </nav>

    <main class="practice-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.practice-shell { color: #27313b; width: 100%; }
.practice-topbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.eyebrow { margin: 0 0 4px; color: #e56f4d; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0; font-size: 28px; line-height: 1.15; }
.route-state { color: #68727c; font-size: 13px; }
.module-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
.module-link { display: flex; align-items: center; gap: 10px; min-height: 62px; padding: 10px 12px; border: 1px solid #dfe3e6; border-radius: 6px; background: #fff; color: #68727c; text-decoration: none; }
.module-link:hover, .module-link.active { border-color: #e56f4d; background: #fff8f5; color: #27313b; }
.module-icon { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 5px; background: #f0f2f3; color: #e56f4d; font-size: 18px; }
.active .module-icon { background: #ffe3d8; }
.module-copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.module-copy strong { font-size: 13px; }
.module-copy small { overflow: hidden; color: #8a949c; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.practice-content { min-width: 0; }
@media (max-width: 640px) {
  .practice-topbar { align-items: flex-start; flex-direction: column; gap: 5px; }
  h1 { font-size: 24px; }
  .route-state { display: none; }
  .module-nav { position: sticky; top: 56px; z-index: 10; grid-template-columns: repeat(4, minmax(76px, 1fr)); overflow-x: auto; margin: 0 -20px 16px; padding: 8px 20px; border-top: 1px solid #eef0f1; border-bottom: 1px solid #dfe3e6; background: rgba(255, 255, 255, .96); }
  .module-link { min-height: 52px; justify-content: center; padding: 7px 4px; }
  .module-icon { width: 24px; height: 24px; font-size: 15px; }
  .module-copy small { display: none; }
  .module-copy strong { font-size: 12px; }
}
</style>
