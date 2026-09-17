<script setup lang="ts">
import { computed, ref } from 'vue'

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

const columns = [
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'activity', header: '活动' },
  {
    accessorKey: 'duration',
    header: '时长',
    cell: ({ row }: { row: { original: ProgressRecord } }) =>
      `${row.original.duration} 分钟`,
  },
]

const stats = computed(() => [
  { value: totalMinutes.value, label: '总练习时长（分钟）' },
  { value: totalSessions.value, label: '练习次数' },
  { value: avgMinutes.value, label: '平均时长（分钟）' },
])
</script>

<template>
  <div class="flex flex-col gap-8">
    <UPageHeader title="学习进度" description="记录你的练习轨迹" />

    <UPageGrid>
      <UPageCard v-for="stat in stats" :key="stat.label">
        <div class="flex flex-col items-center gap-2 py-2 text-center">
          <span class="text-4xl font-bold text-primary">{{ stat.value }}</span>
          <span class="text-sm text-muted">{{ stat.label }}</span>
        </div>
      </UPageCard>
    </UPageGrid>

    <UPageSection title="练习记录">
      <UTable v-if="records.length > 0" :data="records" :columns="columns" />
      <UEmpty
        v-else
        icon="i-lucide-music"
        title="暂无记录"
        description="快去练习吧！"
      />
    </UPageSection>

    <UAlert
      icon="i-lucide-lightbulb"
      color="primary"
      variant="subtle"
      title="提示"
      description="后续将支持自动记录练习时长和成绩曲线"
    />
  </div>
</template>
