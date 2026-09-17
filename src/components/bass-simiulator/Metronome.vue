<script setup lang="ts">
import { watch } from 'vue'
import { useMetronome } from '@/composables/useMetronome'

const props = defineProps<{
  hideControls?: boolean
}>()

const emit = defineEmits<{
  beat: [number]
}>()

const { bpm, beatsPerBar, subdivision, volume, accentPattern, rhythmPattern, isPlaying, currentBeat, toggle, start, stop } = useMetronome()

watch(currentBeat, (beat) => {
  emit('beat', beat)
})

defineExpose({ start, stop, isPlaying })

const timeSigs = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '5/4', beats: 5 },
  { label: '6/8', beats: 6 },
  { label: '7/8', beats: 7 },
]

const subdivisionOptions = [
  { label: '四分', value: 1 },
  { label: '八分', value: 2 },
  { label: '三连', value: 3 },
  { label: '十六', value: 4 },
]

const rhythmPatterns = [
  { label: '正拍', value: 'straight' as const, desc: '标准节拍' },
  { label: '反拍', value: 'offbeat' as const, desc: 'Bass常用' },
  { label: '切分', value: 'syncopated' as const, desc: '摇摆感' },
]

const accentPresets = [
  { label: '第一拍', pattern: [1] },
  { label: '强弱', pattern: [1, 3] },
  { label: '全重音', pattern: [1, 2, 3, 4, 5, 6, 7] },
  { label: '无重音', pattern: [] },
]

const presets = [60, 90, 120, 140, 180]
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-8">
      <template v-if="!hideControls">
        <div class="flex items-center justify-between">
          <div class="flex flex-col items-center">
            <span class="text-5xl font-bold leading-none text-primary sm:text-6xl">{{ bpm }}</span>
            <span class="mt-1 text-xs tracking-widest text-dimmed">BPM</span>
          </div>

          <button
            class="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:size-18"
            :class="isPlaying ? 'bg-error shadow-error/30' : 'shadow-primary/30 hover:shadow-primary/40'"
            :aria-label="isPlaying ? '暂停' : '播放'"
            @click="toggle"
          >
            <UIcon :name="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" class="size-7" />
          </button>
        </div>

        <div class="flex flex-wrap justify-center gap-3 py-2">
          <span
            v-for="i in beatsPerBar"
            :key="i"
            class="size-5 rounded-full bg-elevated transition-all duration-150"
            :class="[
              currentBeat === i - 1 ? 'scale-[1.4] bg-primary shadow-[0_0_12px] shadow-primary/60' : '',
              i === 1 && currentBeat === i - 1 ? '!bg-error shadow-[0_0_16px] shadow-error/70' : '',
            ]"
          />
        </div>
      </template>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label class="text-xs font-medium uppercase tracking-wide text-muted">速度</label>
          <USlider v-model="bpm" :min="40" :max="240" :step="1" />
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="p in presets"
              :key="p"
              :label="String(p)"
              size="xs"
              variant="soft"
              color="neutral"
              @click="bpm = p"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-medium uppercase tracking-wide text-muted">拍号</label>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="ts in timeSigs"
              :key="ts.label"
              :label="ts.label"
              size="sm"
              :variant="beatsPerBar === ts.beats ? 'solid' : 'outline'"
              :color="beatsPerBar === ts.beats ? 'primary' : 'neutral'"
              @click="beatsPerBar = ts.beats"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-medium uppercase tracking-wide text-muted">节奏型</label>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="r in rhythmPatterns"
              :key="r.value"
              :label="r.label"
              size="sm"
              :title="r.desc"
              :variant="rhythmPattern === r.value ? 'solid' : 'outline'"
              :color="rhythmPattern === r.value ? 'primary' : 'neutral'"
              @click="rhythmPattern = r.value"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-medium uppercase tracking-wide text-muted">重音</label>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="a in accentPresets"
              :key="a.label"
              :label="a.label"
              size="sm"
              :variant="JSON.stringify(accentPattern) === JSON.stringify(a.pattern) ? 'solid' : 'outline'"
              :color="JSON.stringify(accentPattern) === JSON.stringify(a.pattern) ? 'primary' : 'neutral'"
              @click="accentPattern = a.pattern"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-medium uppercase tracking-wide text-muted">细分</label>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="s in subdivisionOptions"
              :key="s.value"
              :label="s.label"
              size="sm"
              :variant="subdivision === s.value ? 'solid' : 'outline'"
              :color="subdivision === s.value ? 'primary' : 'neutral'"
              @click="subdivision = s.value"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-medium uppercase tracking-wide text-muted">音量 {{ volume }}dB</label>
          <USlider v-model="volume" :min="-30" :max="0" :step="1" />
        </div>
      </div>
    </div>
  </UCard>
</template>
