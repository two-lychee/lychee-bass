<script setup lang="ts">
import { ref, computed } from 'vue'

interface ProgressRecord {
  date: string
  activity: string
  duration: number // 分钟
}

// 模拟数据，后续可接入 LocalStorage 或后端
const records = ref<ProgressRecord[]>([
  { date: '2026-06-14', activity: '音名训练', duration: 15 },
  { date: '2026-06-14', activity: '音阶探索', duration: 20 },
  { date: '2026-06-13', activity: '自由演奏', duration: 30 },
  { date: '2026-06-12', activity: '音名训练', duration: 10 },
])

const totalMinutes = computed(() => records.value.reduce((sum, r) => sum + r.duration, 0))
const totalSessions = computed(() => records.value.length)
const avgMinutes = computed(() =>
  totalSessions.value > 0 ? Math.round(totalMinutes.value / totalSessions.value) : 0,
)
</script>

<template>
  <div class="progress-page">
    <header class="page-header">
      <h1>学习进度</h1>
      <p class="subtitle">记录你的练习轨迹</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ totalMinutes }}</div>
        <div class="stat-label">总练习时长（分钟）</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalSessions }}</div>
        <div class="stat-label">练习次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ avgMinutes }}</div>
        <div class="stat-label">平均时长（分钟）</div>
      </div>
    </div>

    <section class="records-section">
      <h2>练习记录</h2>
      <div v-if="records.length === 0" class="empty">暂无记录，快去练习吧！</div>
      <div v-else class="records-list">
        <div v-for="(r, i) in records" :key="i" class="record-item">
          <div class="record-date">{{ r.date }}</div>
          <div class="record-activity">{{ r.activity }}</div>
          <div class="record-duration">{{ r.duration }} 分钟</div>
        </div>
      </div>
    </section>

    <div class="tip">
      <strong>💡 提示：</strong>后续将支持自动记录练习时长和成绩曲线
    </div>
  </div>
</template>

<style scoped>
.progress-page {
  color: #333;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #ff8a65;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.records-section h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
}

.record-date {
  color: #999;
  flex: 0 0 100px;
}

.record-activity {
  flex: 1;
  color: #333;
}

.record-duration {
  color: #ff8a65;
  font-weight: 500;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #999;
  background: #fff;
  border-radius: 8px;
  border: 1px dashed #e0e0e0;
}

.tip {
  margin-top: 32px;
  padding: 12px 16px;
  background: #fff;
  border-left: 3px solid #ff8a65;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.tip strong {
  color: #ff8a65;
}
</style>
