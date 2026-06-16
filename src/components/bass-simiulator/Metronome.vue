<template>
  <div class="metronome">
    <div v-if="!hideControls" class="display-section">
      <div class="bpm-display">
        <div class="bpm-value">{{ bpm }}</div>
        <div class="bpm-label">BPM</div>
      </div>
      <button class="play-btn" :class="{ playing: isPlaying }" @click="toggle">
        <span class="icon">{{ isPlaying ? '⏸' : '▶' }}</span>
      </button>
    </div>

    <div v-if="!hideControls" class="beats-display">
      <div
        v-for="i in beatsPerBar"
        :key="i"
        class="beat"
        :class="{ active: currentBeat === i - 1, downbeat: i === 1 }"
      />
    </div>

    <div class="controls">
      <div class="control-group">
        <label>速度</label>
        <input v-model.number="bpm" type="range" min="40" max="240" step="1" class="slider" />
        <div class="presets">
          <button v-for="p in [60, 90, 120, 140, 180]" :key="p" @click="bpm = p" class="preset-btn">
            {{ p }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>拍号</label>
        <div class="btn-group">
          <button
            v-for="ts in timeSigs"
            :key="ts.label"
            class="option-btn"
            :class="{ active: beatsPerBar === ts.beats }"
            @click="beatsPerBar = ts.beats"
          >
            {{ ts.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>节奏型</label>
        <div class="btn-group">
          <button
            v-for="r in rhythmPatterns"
            :key="r.value"
            class="option-btn"
            :class="{ active: rhythmPattern === r.value }"
            @click="rhythmPattern = r.value"
            :title="r.desc"
          >
            {{ r.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>重音</label>
        <div class="btn-group">
          <button
            v-for="a in accentPresets"
            :key="a.label"
            class="option-btn"
            :class="{ active: JSON.stringify(accentPattern) === JSON.stringify(a.pattern) }"
            @click="accentPattern = a.pattern"
          >
            {{ a.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>细分</label>
        <div class="btn-group">
          <button
            v-for="s in subdivisionOptions"
            :key="s.value"
            class="option-btn"
            :class="{ active: subdivision === s.value }"
            @click="subdivision = s.value"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>音量 {{ volume }}dB</label>
        <input v-model.number="volume" type="range" min="-30" max="0" step="1" class="slider" />
      </div>
    </div>
  </div>
</template>

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
</script>

<style scoped>
.metronome {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 32px;
  color: #333;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.display-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.bpm-display {
  text-align: center;
}

.bpm-value {
  font-size: 56px;
  font-weight: 700;
  color: #ff8a65;
  line-height: 1;
}

.bpm-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  letter-spacing: 1px;
}

.play-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: none;
  background: #ff8a65;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3);
}

.play-btn .icon {
  font-size: 28px;
}

.play-btn:hover {
  background: #ff7043;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 138, 101, 0.4);
}

.play-btn:active {
  transform: scale(0.98);
}

.play-btn.playing {
  background: #e57373;
  box-shadow: 0 4px 12px rgba(229, 115, 115, 0.3);
}

.beats-display {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
  padding: 16px 0;
}

.beat {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.15s;
}

.beat.active {
  background: #ff8a65;
  transform: scale(1.4);
  box-shadow: 0 0 12px rgba(255, 138, 101, 0.6);
}

.beat.downbeat.active {
  background: #ef5350;
  box-shadow: 0 0 16px rgba(239, 83, 80, 0.7);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-group label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff8a65;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #ff7043;
  transform: scale(1.1);
}

.presets,
.btn-group {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.preset-btn,
.option-btn {
  flex: 1;
  min-width: 50px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
  color: #666;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.preset-btn:hover,
.option-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.option-btn.active {
  background: #ff8a65;
  border-color: #ff8a65;
  color: #fff;
}

@media (max-width: 640px) {
  .metronome {
    padding: 24px;
  }

  .bpm-value {
    font-size: 48px;
  }

  .play-btn {
    width: 64px;
    height: 64px;
  }

  .play-btn .icon {
    font-size: 24px;
  }
}
</style>
