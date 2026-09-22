<script setup lang="ts">
import { computed } from 'vue'
import { usePracticeHistory } from '@/composables/usePracticeHistory'
import { foundationExercises } from '@/music/foundation-exercises'
const { records, storageError } = usePracticeHistory()
const totalMinutes = computed(() =>
  Math.round(records.value.reduce((sum, r) => sum + r.seconds, 0) / 60),
)
const titleFor = (id: string) => foundationExercises.find((e) => e.id === id)?.title ?? id
const dateLabel = (date: string) =>
  new Date(date).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>
<template>
  <section>
    <header class="training-intro">
      <div>
        <p class="eyebrow">练习记录 / PRACTICE LOG</p>
        <h1>每一次，都算数。</h1>
        <p class="intro-copy">保存最近 200 次基础训练，在上次的速度继续。</p>
      </div>
      <div class="intro-note">
        <strong>{{ totalMinutes }} 分钟</strong
        ><span>{{ records.length }} 次练习 · 此浏览器本地记录</span>
      </div>
    </header>
    <p v-if="storageError" class="inline-message" role="alert">{{ storageError }}</p>
    <div v-if="!records.length" class="empty-state">
      <h2>还没有练习记录。</h2>
      <p>完成一项基础训练后，时长、速度和自评会出现在这里。</p>
      <RouterLink class="action-button primary" to="/">选择第一项练习 →</RouterLink>
    </div>
    <div v-else class="history-list">
      <RouterLink
        v-for="record in records"
        :key="record.id"
        class="history-row"
        :to="`/practice/training/${record.exerciseId}`"
        ><time :datetime="record.date">{{ dateLabel(record.date) }}</time
        ><strong>{{ titleFor(record.exerciseId) }}</strong
        ><span>{{ record.bpm }} BPM</span
        ><span>{{ Math.floor(record.seconds / 60) }}分{{ record.seconds % 60 }}秒</span
        ><span>{{ record.rating ?? '未自评' }}</span
        ><span aria-hidden="true">↗</span></RouterLink
      >
    </div>
  </section>
</template>
