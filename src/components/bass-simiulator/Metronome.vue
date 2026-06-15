<template>
  <div class="metronome">
    <div class="header">
      <h3>节拍器</h3>
      <button class="play-btn" :class="{ playing: isPlaying }" @click="toggle">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
    </div>

    <div class="beats-display">
      <div
        v-for="i in beatsPerBar"
        :key="i"
        class="beat"
        :class="{ active: currentBeat === i - 1, downbeat: i === 1 }"
      />
    </div>

    <div class="control">
      <label>BPM: {{ bpm }}</label>
      <input v-model.number="bpm" type="range" min="40" max="240" step="1" />
      <div class="presets">
        <button v-for="p in [60, 90, 120, 140]" :key="p" @click="bpm = p" class="preset-btn">
          {{ p }}
        </button>
      </div>
    </div>

    <div class="control">
      <label>拍号</label>
      <div class="time-sigs">
        <button
          v-for="ts in timeSigs"
          :key="ts.label"
          class="sig-btn"
          :class="{ active: beatsPerBar === ts.beats }"
          @click="beatsPerBar = ts.beats"
        >
          {{ ts.label }}
        </button>
      </div>
    </div>

    <div class="control">
      <label>细分</label>
      <div class="subdivisions">
        <button
          v-for="s in [1, 2, 3, 4]"
          :key="s"
          class="sub-btn"
          :class="{ active: subdivision === s }"
          @click="subdivision = s"
        >
          {{ s === 1 ? '四分' : s === 2 ? '八分' : s === 3 ? '三连' : '十六分' }}
        </button>
      </div>
    </div>

    <div class="control">
      <label>音量</label>
      <input v-model.number="volume" type="range" min="-30" max="0" step="1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMetronome } from '@/composables/useMetronome'

const { bpm, beatsPerBar, subdivision, volume, isPlaying, currentBeat, toggle } = useMetronome()

const timeSigs = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '5/4', beats: 5 },
  { label: '6/8', beats: 6 },
]
</script>

<style scoped>
.metronome {
  background: #2c2424;
  border: 1px solid #3a3030;
  border-radius: 8px;
  padding: 20px;
  color: #eee;
  min-width: 280px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h3 {
  margin: 0;
  font-size: 18px;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #ff8a65;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover {
  background: #ff7043;
  transform: scale(1.05);
}

.play-btn.playing {
  background: #e57373;
}

.beats-display {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
  padding: 12px 0;
}

.beat {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3a3030;
  transition: all 0.1s;
}

.beat.active {
  background: #ff8a65;
  transform: scale(1.3);
  box-shadow: 0 0 8px #ff8a65;
}

.beat.downbeat.active {
  background: #ef5350;
  box-shadow: 0 0 12px #ef5350;
}

.control {
  margin-bottom: 16px;
}

.control:last-child {
  margin-bottom: 0;
}

.control label {
  display: block;
  font-size: 13px;
  color: #aaa;
  margin-bottom: 8px;
}

.control input[type='range'] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #3a3030;
  outline: none;
  -webkit-appearance: none;
}

.control input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff8a65;
  cursor: pointer;
}

.presets,
.time-sigs,
.subdivisions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.preset-btn,
.sig-btn,
.sub-btn {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #3a3030;
  background: #1a1515;
  color: #ccc;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover,
.sig-btn:hover,
.sub-btn:hover {
  background: #3a3030;
}

.sig-btn.active,
.sub-btn.active {
  background: #ff8a65;
  border-color: #ff8a65;
  color: #fff;
}
</style>
