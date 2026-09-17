<script setup lang="ts">
import { computed, ref } from 'vue'
import BassFretboard from '@/components/bass-simiulator/BassFretboard.vue'
import NoteQuiz from '@/components/bass-simiulator/NoteQuiz.vue'
import ScaleExplorer from '@/components/bass-simiulator/ScaleExplorer.vue'
import { TUNINGS } from '@/components/bass-simiulator/tunings'

type Mode = 'free' | 'quiz' | 'scale'

const mode = ref<Mode>('free')
const showSettings = ref(false)
const selectedTuningId = ref(TUNINGS.standard4.id)
const showNoteNames = ref(false)

const selectedTuning = computed(
  () => TUNINGS[selectedTuningId.value] ?? TUNINGS.standard4,
)

const tabsItems = [
  { label: '自由演奏', value: 'free' as Mode, icon: 'i-lucide-guitar' },
  { label: '音名训练', value: 'quiz' as Mode, icon: 'i-lucide-target' },
  { label: '音阶探索', value: 'scale' as Mode, icon: 'i-lucide-music-2' },
]

const tuningItems = Object.values(TUNINGS)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UTabs v-model="mode" :items="tabsItems" :content="false" class="flex-1" />

      <UButton
        v-if="mode === 'free'"
        label="配置"
        icon="i-lucide-settings"
        variant="outline"
        class="sm:shrink-0"
        @click="showSettings = true"
      />
    </div>

    <main class="flex w-full justify-center">
      <BassFretboard
        v-if="mode === 'free'"
        :tuning="selectedTuning.notes"
        :initial-show-note-names="showNoteNames"
        :show-toggle="true"
      />
      <NoteQuiz v-else-if="mode === 'quiz'" />
      <ScaleExplorer v-else-if="mode === 'scale'" />
    </main>

    <UModal v-model:open="showSettings" title="指板配置">
      <template #body>
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <span class="text-sm font-medium text-muted">调弦</span>
            <USelect
              v-model="selectedTuningId"
              :items="tuningItems"
              value-key="id"
              label-key="name"
              description-key="description"
            />
            <p class="text-xs text-dimmed">{{ selectedTuning.description }}</p>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <UBadge
                v-for="(note, i) in selectedTuning.notes"
                :key="i"
                :label="note"
                color="primary"
                variant="subtle"
                class="font-mono"
              />
            </div>
          </div>

          <UCheckbox v-model="showNoteNames" label="默认显示音名" />
        </div>
      </template>
    </UModal>
  </div>
</template>
