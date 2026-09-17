<script setup lang="ts">
defineProps<{
  instruction: {
    title: string
    detail: string
    rightHand: string
    rhythm: string
    leftHand: string
    note: string
    position: string
  }
  tip: string
  isPlaying: boolean
}>()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold uppercase tracking-wider text-primary">动作提示</span>
          <h2 class="text-lg font-bold text-highlighted">这一拍怎么做</h2>
        </div>
        <span
          class="size-2 rounded-full"
          :class="isPlaying ? 'bg-success shadow-[0_0_0_4px] shadow-success/20' : 'bg-elevated'"
        />
      </div>
    </template>

    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-3 rounded-md p-3 ring-1 ring-default">
        <span class="grid h-7 w-11 shrink-0 place-items-center rounded bg-primary/10 text-xs font-bold text-primary">
          右手
        </span>
        <div class="flex flex-col gap-0.5">
          <strong class="text-sm text-highlighted">{{ instruction.rightHand }}</strong>
          <span class="text-xs text-muted">{{ instruction.rhythm }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-md p-3 ring-1 ring-default">
        <span class="grid h-7 w-11 shrink-0 place-items-center rounded bg-muted text-xs font-bold text-muted">
          左手
        </span>
        <div class="flex flex-col gap-0.5">
          <strong class="text-sm text-highlighted">{{ instruction.leftHand }}</strong>
          <span class="text-xs text-muted">{{ instruction.note }}</span>
        </div>
      </div>

      <UAlert
        icon="i-lucide-lightbulb"
        color="warning"
        variant="subtle"
        title="练习重点"
        :description="tip"
        class="mt-2"
      />
    </div>
  </UCard>
</template>
