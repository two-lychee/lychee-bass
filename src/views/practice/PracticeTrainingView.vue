<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { foundationExercises } from '@/music/foundation-exercises'
import FoundationSession from '@/components/bass-simiulator/FoundationSession.vue'
const route = useRoute()
const exercise = computed(() => foundationExercises.find((e) => e.id === route.params.exerciseId))
</script>
<template>
  <FoundationSession v-if="exercise" :key="exercise.id" :exercise="exercise" />
  <section v-else class="empty-state">
    <h1>没有找到这项练习</h1>
    <RouterLink to="/">返回基础训练 →</RouterLink>
  </section>
</template>
