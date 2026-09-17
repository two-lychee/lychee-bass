<script setup lang="ts">
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const tunings = [
  { string: '4弦', note: 'E1', freq: '41.2 Hz' },
  { string: '3弦', note: 'A1', freq: '55.0 Hz' },
  { string: '2弦', note: 'D2', freq: '73.4 Hz' },
  { string: '1弦', note: 'G2', freq: '98.0 Hz' },
]

const intervals = [
  { name: '根音', semitones: 0, example: 'C' },
  { name: '小二度', semitones: 1, example: 'C → C#' },
  { name: '大二度', semitones: 2, example: 'C → D' },
  { name: '小三度', semitones: 3, example: 'C → D#' },
  { name: '大三度', semitones: 4, example: 'C → E' },
  { name: '纯四度', semitones: 5, example: 'C → F' },
  { name: '减五度（蓝调音）', semitones: 6, example: 'C → F#' },
  { name: '纯五度', semitones: 7, example: 'C → G' },
  { name: '小六度', semitones: 8, example: 'C → G#' },
  { name: '大六度', semitones: 9, example: 'C → A' },
  { name: '小七度', semitones: 10, example: 'C → A#' },
  { name: '大七度', semitones: 11, example: 'C → B' },
  { name: '八度', semitones: 12, example: 'C → C' },
]

const intervalColumns = [
  { accessorKey: 'name', header: '名称' },
  { accessorKey: 'semitones', header: '半音数' },
  { accessorKey: 'example', header: '示例（以 C 为根音）' },
]

const rhythmTips = [
  { title: '拍号', description: '如 4/4 表示每小节 4 拍，每拍为四分音符' },
  { title: 'BPM', description: '每分钟拍数（Beats Per Minute），如 120 BPM' },
  { title: '节拍器', description: '帮助保持稳定节奏的工具' },
  { title: '常见拍号', description: '4/4（最常见）、3/4（华尔兹）、6/8（进行曲）' },
]

const bassRoles = [
  { title: '节奏基础', description: '与鼓配合，构成节奏组（Rhythm Section）' },
  { title: '和声支撑', description: '通常演奏根音或和弦内音' },
  { title: '连接桥梁', description: '在旋律和鼓之间架起桥梁' },
  { title: '低音填充', description: '填补频率范围，让音乐更饱满' },
]

const studyAdvice = [
  '先熟悉指板上的音名位置',
  '从小调五声音阶开始练习即兴',
  '多听、多模仿经典 bass line',
  '使用节拍器练习，培养稳定的节奏感',
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <UPageHeader title="基础乐理" description="贝斯演奏必备的音乐理论知识" />

    <UPageSection
      title="贝斯调弦"
      icon="i-lucide-guitar"
      description="标准四弦贝斯从粗到细（从低到高）的调弦为："
    >
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <UCard v-for="t in tunings" :key="t.note">
          <div class="flex flex-col items-center gap-1 text-center">
            <span class="text-xs text-dimmed">{{ t.string }}</span>
            <span class="text-2xl font-bold text-primary">{{ t.note }}</span>
            <span class="text-xs text-dimmed">{{ t.freq }}</span>
          </div>
        </UCard>
      </div>
      <p class="mt-3 text-sm italic text-dimmed">
        贝斯比吉他低一个八度，相邻弦之间为纯四度关系。
      </p>
    </UPageSection>

    <UPageSection
      title="音名与半音"
      icon="i-lucide-music"
      description="西方音乐体系中，一个八度内有 12 个半音，对应的音名为："
    >
      <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
        <UBadge
          v-for="n in noteNames"
          :key="n"
          :label="n"
          variant="subtle"
          class="justify-center py-2"
        />
      </div>
      <ul class="mt-4 flex flex-col gap-2 text-sm text-muted">
        <li><strong class="text-highlighted">半音</strong>：相邻两个音之间的最小距离（如 C → C#）</li>
        <li><strong class="text-highlighted">全音</strong>：两个半音的距离（如 C → D）</li>
        <li>E → F 和 B → C 之间只有半音，没有黑键</li>
      </ul>
    </UPageSection>

    <UPageSection title="音阶与调式" icon="i-lucide-music-2">
      <div class="flex flex-col gap-4">
        <div>
          <h3 class="mb-1 font-semibold text-highlighted">大调音阶（Major Scale）</h3>
          <p class="text-sm text-muted">音程结构：<code class="font-mono text-primary">全 - 全 - 半 - 全 - 全 - 全 - 半</code></p>
          <p class="mt-1 rounded-md border-s-2 border-primary bg-muted px-3 py-2 font-mono text-sm">
            例：C 大调 = C D E F G A B C
          </p>
        </div>
        <div>
          <h3 class="mb-1 font-semibold text-highlighted">自然小调音阶（Natural Minor Scale）</h3>
          <p class="text-sm text-muted">音程结构：<code class="font-mono text-primary">全 - 半 - 全 - 全 - 半 - 全 - 全</code></p>
          <p class="mt-1 rounded-md border-s-2 border-primary bg-muted px-3 py-2 font-mono text-sm">
            例：A 小调 = A B C D E F G A
          </p>
        </div>
        <div>
          <h3 class="mb-1 font-semibold text-highlighted">五声音阶（Pentatonic Scale）</h3>
          <p class="text-sm text-muted"><strong class="text-highlighted">小调五声</strong>最常用于蓝调和摇滚，只有 5 个音，容易即兴。</p>
          <p class="mt-1 rounded-md border-s-2 border-primary bg-muted px-3 py-2 font-mono text-sm">
            例：A 小调五声 = A C D E G
          </p>
        </div>
        <div>
          <h3 class="mb-1 font-semibold text-highlighted">布鲁斯音阶（Blues Scale）</h3>
          <p class="text-sm text-muted">在小调五声基础上加入"蓝调音"（b5）。</p>
          <p class="mt-1 rounded-md border-s-2 border-primary bg-muted px-3 py-2 font-mono text-sm">
            例：A 布鲁斯 = A C D D# E G
          </p>
        </div>
      </div>
    </UPageSection>

    <UPageSection
      title="音程"
      icon="i-lucide-ruler"
      description="两个音之间的距离称为音程，以半音数计算："
    >
      <UTable :data="intervals" :columns="intervalColumns" />
    </UPageSection>

    <UPageSection title="节奏基础" icon="i-lucide-metronome">
      <div class="flex flex-col gap-3">
        <div v-for="tip in rhythmTips" :key="tip.title" class="flex flex-col gap-1">
          <strong class="text-highlighted">{{ tip.title }}</strong>
          <span class="text-sm text-muted">{{ tip.description }}</span>
        </div>
      </div>
    </UPageSection>

    <UPageSection title="贝斯在乐队中的角色" icon="i-lucide-target">
      <div class="flex flex-col gap-3">
        <div v-for="role in bassRoles" :key="role.title" class="flex flex-col gap-1">
          <strong class="text-highlighted">{{ role.title }}</strong>
          <span class="text-sm text-muted">{{ role.description }}</span>
        </div>
      </div>
    </UPageSection>

    <UPageSection title="学习建议" icon="i-lucide-lightbulb">
      <ul class="flex flex-col gap-2 text-sm text-muted">
        <li v-for="advice in studyAdvice" :key="advice" class="flex items-center gap-2">
          <UIcon name="i-lucide-check" class="size-4 shrink-0 text-primary" />
          {{ advice }}
        </li>
      </ul>
    </UPageSection>
  </div>
</template>
