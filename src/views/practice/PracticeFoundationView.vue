<script setup lang="ts">
import { computed } from 'vue'
import { foundationExercises, trainingCategories } from '@/music/foundation-exercises'
import { usePracticeHistory } from '@/composables/usePracticeHistory'

const { records } = usePracticeHistory()
const recent = computed(() => {
  const record = records.value[0]
  const exercise = foundationExercises.find((e) => e.id === record?.exerciseId)
  return record && exercise ? { record, exercise } : null
})
const latestFor = (id: string) => records.value.find((r) => r.exerciseId === id)
</script>

<template>
  <div class="training-index">
    <header class="training-intro">
      <div>
        <p class="eyebrow">基础训练 / BASS PRACTICE</p>
        <h1>从每一次拨弦开始。</h1>
        <p class="intro-copy">节奏、指法，再到双手配合。拿起贝斯，选一项开始。</p>
      </div>
      <div class="intro-note">
        <span>四弦标准调弦</span><strong>E · A · D · G</strong><span>3 个方向 / 9 项练习</span>
      </div>
    </header>

    <RouterLink v-if="recent" class="resume-strip" :to="`/practice/training/${recent.exercise.id}`">
      <span class="eyebrow">继续上次</span><strong>{{ recent.exercise.title }}</strong>
      <span>{{ recent.record.bpm }} BPM · {{ recent.record.rating ?? '待自评' }}</span
      ><span aria-hidden="true">↗</span>
    </RouterLink>

    <section
      v-for="category in trainingCategories"
      :key="category.id"
      class="training-section"
      :aria-labelledby="`category-${category.id}`"
    >
      <div class="category-heading">
        <span class="category-number">{{ category.number }}</span>
        <div>
          <h2 :id="`category-${category.id}`">{{ category.title }}</h2>
          <p>{{ category.subtitle }}</p>
          <span class="category-detail">{{ category.detail }}</span>
        </div>
      </div>
      <div class="exercise-directory">
        <RouterLink
          v-for="(exercise, index) in foundationExercises.filter((e) => e.category === category.id)"
          :key="exercise.id"
          :to="`/practice/training/${exercise.id}`"
          class="exercise-row"
        >
          <span class="row-number">{{ category.number }}.{{ index + 1 }}</span>
          <div>
            <h3>{{ exercise.title }}</h3>
            <p>{{ exercise.description }}</p>
          </div>
          <span class="row-meta">{{
            latestFor(exercise.id)?.rating ?? `${exercise.bpm} BPM 起步`
          }}</span>
          <span class="row-arrow" aria-hidden="true">↗</span>
        </RouterLink>
      </div>
    </section>
    <footer class="directory-footer">
      <span>按顺序建立基础，也可以直接进入需要巩固的练习。</span
      ><RouterLink to="/tools">指板与辅助工具 ↗</RouterLink>
    </footer>
  </div>
</template>
