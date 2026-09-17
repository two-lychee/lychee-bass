<script setup lang="ts">
const techStack = ['Vue 3', 'TypeScript', 'Vite', 'Tone.js', 'Pinia']

const features = [
  { title: '自由演奏', description: '交互式指板，支持点击/拖动发声' },
  { title: '音名训练', description: '随机测验，帮助记忆指板音位' },
  { title: '音阶探索', description: '可视化调式，理解音的角色' },
]

const plans = [
  '节拍器与录音功能',
  '真实采样音色',
  '学习进度持久化',
  '曲目库与谱面播放',
  '更多学习模块（和弦识别、音程训练等）',
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <UPageHeader title="关于 Lychee Bass" description="为贝斯自学者打造的在线工具集" />

    <UPageSection
      title="项目简介"
      description="Lychee Bass 是一个开源的贝斯学习平台，提供交互式指板、音名训练、音阶探索等实用工具。我们相信，好的工具能让学习变得更高效、更有趣。"
    />

    <UPageSection title="当前功能">
      <div class="flex flex-col gap-4">
        <div v-for="f in features" :key="f.title" class="flex flex-col gap-1">
          <strong class="text-highlighted">{{ f.title }}</strong>
          <span class="text-sm text-muted">— {{ f.description }}</span>
        </div>
      </div>
    </UPageSection>

    <UPageSection title="技术栈">
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tech in techStack"
          :key="tech"
          :label="tech"
          color="primary"
          variant="subtle"
        />
      </div>
    </UPageSection>

    <UPageSection title="未来计划">
      <ul class="flex flex-col gap-2 text-sm text-muted">
        <li v-for="plan in plans" :key="plan" class="flex items-center gap-2">
          <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-primary" />
          {{ plan }}
        </li>
      </ul>
    </UPageSection>

    <UPageSection
      title="反馈与贡献"
      description="这是一个开源项目，欢迎提交 issue 和 PR。如果你有好的想法或建议，也可以通过 GitHub 联系我们。"
    />
  </div>
</template>
