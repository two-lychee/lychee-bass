<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()

const modules = [
  {
    name: 'practice-library',
    label: '练习库',
    description: '选择今天要练的内容',
    icon: 'i-lucide-library',
  },
  {
    name: 'practice-lesson',
    label: '谱子练习',
    description: '节奏、Tab 与指板同步',
    icon: 'i-lucide-file-music',
  },
  {
    name: 'practice-metronome',
    label: '节拍器',
    description: '独立练节拍与律动',
    icon: 'i-lucide-metronome',
  },
]

const currentLabel = computed(
  () => modules.find((item) => item.name === route.name)?.label,
)
</script>

<template>
  <div class="flex w-full flex-col">
    <UPageHeader headline="练习空间" title="今天练什么？">
      <template #links>
        <UBadge v-if="currentLabel" :label="currentLabel" color="primary" variant="subtle" />
      </template>
    </UPageHeader>

    <UPageGrid class="max-md:sticky max-md:top-16 max-md:z-10 mb-6 max-md:-mx-4 max-md:bg-default/95 max-md:px-4 max-md:py-2">
      <UPageCard
        v-for="item in modules"
        :key="item.name"
        :to="{ name: item.name }"
        :icon="item.icon"
        :title="item.label"
        :description="item.description"
        :highlight="route.name === item.name"
      />
    </UPageGrid>

    <main class="min-w-0">
      <RouterView />
    </main>
  </div>
</template>
