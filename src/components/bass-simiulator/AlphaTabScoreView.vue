<template>
  <section class="alphatab-panel">
    <div class="panel-heading">
      <div>
        <span class="panel-kicker">原谱对应</span>
        <h2>五线谱与 Tab</h2>
      </div>
      <span v-if="isLoading" class="viewer-status">正在绘制...</span>
      <span v-else-if="errorMessage" class="viewer-status error">原谱暂时无法绘制</span>
    </div>
    <p v-if="errorMessage" class="viewer-error">{{ errorMessage }}</p>
    <div ref="viewportEl" class="score-viewport">
      <div ref="scoreElement" class="alphatab-viewer" aria-label="原始五线谱和 Tab" />
      <div v-if="highlightStyle" class="measure-highlight" :style="highlightStyle" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  sourceFile?: string
  trackIndex?: number
  measureIndex?: number
  totalMeasures?: number
  isPlaying?: boolean
}>()
const scoreElement = ref<HTMLElement>()
const viewportEl = ref<HTMLElement>()
const isLoading = ref(false)
const errorMessage = ref('')
const highlightStyle = ref<Record<string, string> | null>(null)
let api: {
  load: (source: string, tracks?: number[]) => boolean
  destroy: () => void
  renderer?: {
    boundsLookup?: {
      findMasterBarByIndex: (
        index: number,
      ) => { visualBounds: { x: number; y: number; w: number; h: number } } | null
    } | null
  }
  renderFinished?: { on: (handler: () => void) => void; off?: (handler: () => void) => void }
} | null = null

const updateHighlight = () => {
  const bounds = api?.renderer?.boundsLookup?.findMasterBarByIndex(props.measureIndex ?? 0)
  let x: number
  let y: number
  let w: number
  let h: number
  if (bounds) {
    ;({ x, y, w, h } = bounds.visualBounds)
  } else {
    const surface = scoreElement.value?.querySelector<HTMLElement>('.at-surface')
    const systems = surface
      ? [...surface.children].filter((child) => child.querySelector('svg'))
      : []
    if (!surface || !systems.length) return
    const system = systems[
      Math.min(
        systems.length - 1,
        Math.floor(
          ((props.measureIndex ?? 0) / Math.max(1, props.totalMeasures ?? 1)) * systems.length,
        ),
      )
    ] as HTMLElement
    const style = system.getAttribute('style') || ''
    const top = Number(style.match(/top:\s*([\d.]+)px/)?.[1] || 0)
    const height = Number(style.match(/height:\s*([\d.]+)px/)?.[1] || 240)
    x = 0
    y = top
    w = surface.clientWidth
    h = height
  }
  highlightStyle.value = {
    left: `${Math.max(0, x - 4)}px`,
    top: `${Math.max(0, y - 4)}px`,
    width: `${w + 8}px`,
    height: `${h + 8}px`,
  }
  viewportEl.value?.scrollTo({ top: Math.max(0, y - 32), behavior: 'smooth' })
}

const loadScore = async () => {
  if (!scoreElement.value || !props.sourceFile) return
  isLoading.value = true
  errorMessage.value = ''
  api?.destroy()
  scoreElement.value.replaceChildren()
  try {
    const alphaTab = await import('@coderline/alphatab')
    const instance = new alphaTab.AlphaTabApi(scoreElement.value, {
      core: { fontDirectory: '/assets/font/', enableLazyLoading: false },
      display: { scale: 0.9, stretchForce: 0.75 },
      player: { enablePlayer: false },
    })
    api = instance
    instance.renderFinished?.on(updateHighlight)
    if (!instance.load(props.sourceFile, [props.trackIndex ?? 0])) {
      throw new Error('alphaTab 不支持这个谱面格式')
    }
    let attempts = 0
    const waitForBounds = () => {
      updateHighlight()
      attempts += 1
      if (!highlightStyle.value && attempts < 20) window.setTimeout(waitForBounds, 100)
    }
    window.setTimeout(waitForBounds, 100)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '无法绘制原始谱面'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.sourceFile, props.trackIndex],
  () => void loadScore(),
)
watch(() => [props.measureIndex, props.isPlaying], updateHighlight)
onMounted(() => void loadScore())
onUnmounted(() => api?.destroy())
</script>

<style scoped>
.alphatab-panel {
  padding: 20px;
  border: 1px solid #dfe3e6;
  border-radius: 8px;
  background: #fff;
}
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}
.panel-kicker {
  color: #e56f4d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h2 {
  margin: 4px 0 0;
  font-size: 18px;
}
.viewer-status {
  color: #68727c;
  font-size: 12px;
}
.viewer-status.error,
.viewer-error {
  color: #b94d31;
}
.viewer-error {
  margin: 0 0 10px;
  font-size: 12px;
}
.score-viewport {
  position: relative;
  min-height: 150px;
  max-height: 620px;
  overflow: auto;
  background: #fafbfb;
  border: 1px solid #eef0f1;
}
.measure-highlight {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  border: 3px solid #e56f4d;
  border-radius: 6px;
  background: rgba(229, 111, 77, 0.08);
  box-shadow: 0 0 0 3px rgba(229, 111, 77, 0.14);
  transition:
    top 0.25s,
    left 0.25s;
}
@media (max-width: 640px) {
  .alphatab-panel {
    padding: 14px;
  }
  .alphatab-viewer {
    min-width: 680px;
  }
}
</style>
