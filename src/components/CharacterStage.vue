<template>
  <div class="character-stage">
    <picture class="character-image">
      <source :srcset="`${baseUrl}assets/characters/${imageName}.webp`" type="image/webp" />
      <img
        :src="`${baseUrl}assets/characters/${imageName}.png`"
        :alt="imageAlt"
        loading="lazy"
      />
    </picture>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { TimerMode, TimerStatus } from '../types/timer'

const props = defineProps<{
  mode: TimerMode
  status: TimerStatus
  motionEnabled: boolean
}>()

const baseUrl = import.meta.env.BASE_URL

const ROLL_MS = 1200

const focusRollActive = ref(false)
let rollTimer: number | null = null

const clearRollTimer = () => {
  if (rollTimer !== null) {
    window.clearTimeout(rollTimer)
    rollTimer = null
  }
}

const triggerFocusRoll = () => {
  clearRollTimer()
  focusRollActive.value = true
  rollTimer = window.setTimeout(() => {
    focusRollActive.value = false
    rollTimer = null
  }, ROLL_MS)
}

watch(
  () => [props.mode, props.status, props.motionEnabled] as const,
  (curr, prev) => {
    const [mode, status, motionEnabled] = curr

    // prev は初回 undefined になりうる
    const prevMode = prev?.[0]
    const prevStatus = prev?.[1]

    // Focus以外、running以外、motionOff はrollを止める
    if (mode !== 'focus' || status !== 'running' || !motionEnabled) {
      focusRollActive.value = false
      clearRollTimer()
      return
    }

    // runningに遷移した瞬間 or focusへ切替直後にrollを一回だけ出す
    const becameRunning = prevStatus !== 'running' && status === 'running'
    const switchedToFocus = prevMode !== 'focus' && mode === 'focus'

    if (becameRunning || switchedToFocus) {
      triggerFocusRoll()
    }
  },
  { immediate: true }
)


onBeforeUnmount(() => {
  clearRollTimer()
})

const imageName = computed(() => {
  // Focus
  if (props.mode === 'focus') {
    if (!props.motionEnabled) return 'focus-idle' // Motion OFF は固定でOK（好みでbreathでも可）

    // Motion ON のとき
    if (props.status !== 'running') {
      // 停止中（idle/paused）はidle表示
      return 'focus-idle'
    }

    // running中は、開始直後だけroll → それ以外はbreathing
    return focusRollActive.value ? 'focus-roll' : 'focus-breathing'
  }

  // Break
  if (!props.motionEnabled) {
    // Motion OFF でも break-sleep を出すならこれ
    return 'break-sleep'
  }

  // Motion ON: running中はsleep、停止中はidle
  return props.status === 'running' ? 'break-sleep' : 'break-idle'
})


const imageAlt = computed(() => {
  const modeStr = props.mode === 'focus' ? 'Focus' : 'Break'
  const stateStr =
    props.mode === 'focus'
      ? !props.motionEnabled
        ? 'Breathing'
        : focusRollActive.value
          ? 'Rolling'
          : 'Idle'
      : !props.motionEnabled
        ? 'Sleeping'
        : props.status === 'running'
          ? 'Sleeping'
          : 'Idle'

  return `${modeStr} mode - ${stateStr}`
})
</script>

<style scoped>
.character-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  min-height: 200px;
}

.character-image {
  display: block;
}

.character-image img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

@media (max-width: 480px) {
  .character-image img {
    max-height: 200px;
  }
}
</style>
