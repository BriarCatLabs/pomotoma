<template>
  <div class="timer-page">
    <div class="container">
      <!-- Settings Button (Top Left) -->
      <button type="button" class="settings-button" @click="openModal">⚙️</button>

      <!-- Motion Toggle (Top Right) -->
      <button type="button" class="motion-toggle" @click="toggleMotion">
        Motion: {{ motionEnabled ? 'On' : 'Off' }}
      </button>

      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button
          type="button"
          class="mode-tab"
          :class="{ active: timerState.mode === 'focus' }"
          :disabled="timerState.status !== 'idle'"
          @click="() => setMode('focus')"
        >
          Focus
        </button>
        <button
          type="button"
          class="mode-tab"
          :class="{ active: timerState.mode === 'break' }"
          :disabled="timerState.status !== 'idle'"
          @click="() => setMode('break')"
        >
          Break
        </button>
      </div>

      <!-- Character Stage -->
      <CharacterStage
        :mode="timerState.mode"
        :status="timerState.status"
        :motion-enabled="motionEnabled"
      />

      <!-- Timer Display -->
      <div class="timer-display">
        {{ formatMMSS(timerState.remainingSec) }}
      </div>

      <!-- Controls -->
      <TimerControls
        :status="timerState.status"
        @start="start"
        @pause="pause"
        @resume="resume"
        @reset="reset"
        @skip="skip"
      />
    </div>

    <!-- Settings Modal -->
    <SettingsModal
      :open="isModalOpen"
      :status="timerState.status"
      :initial-focus-minutes="settings.focusMinutes"
      :initial-break-minutes="settings.breakMinutes"
      :initial-motion-enabled="settings.motionEnabled"
      :initial-chime-enabled="settings.chimeEnabled"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useTimer, formatMMSS } from '../composables/useTimer'
import { useSettings } from '../composables/useSettings'
import CharacterStage from './CharacterStage.vue'
import TimerControls from './TimerControls.vue'
import SettingsModal from './SettingsModal.vue'

const { state: timerState, start: timerStart, pause, resume: timerResume, reset, skip: timerSkip, setMode, setDurations, setOnTimeUp } = useTimer()
const { settings, save: saveSettingsToStorage } = useSettings()

const motionEnabled = computed(() => settings.value.motionEnabled)
const chimeEnabled = computed(() => settings.value.chimeEnabled)

let audioInstance: HTMLAudioElement | null = null

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const primeAudio = () => {
  if (!audioInstance) return
  try {
    const playPromise = audioInstance.play()
    if (playPromise) {
      playPromise.then(() => {
        audioInstance?.pause()
        if (audioInstance) audioInstance.currentTime = 0
      }).catch(() => {
        // Priming failed, ignore
      })
    }
  } catch {
    // Priming failed, ignore
  }
}

const playChime = () => {
  if (!chimeEnabled.value || !audioInstance) return
  try {
    audioInstance.currentTime = 0
    const playPromise = audioInstance.play()
    if (playPromise) {
      playPromise.catch((err) => {
        console.debug('Chime playback failed:', err)
      })
    }
  } catch (err) {
    console.debug('Chime playback error:', err)
  }
}

const start = () => {
  primeAudio()
  timerStart()
}

const resume = () => {
  primeAudio()
  timerResume()
}

const skip = () => {
  primeAudio()
  timerSkip()
}

const toggleMotion = () => {
  const newSettings = {
    focusMinutes: settings.value.focusMinutes,
    breakMinutes: settings.value.breakMinutes,
    motionEnabled: !settings.value.motionEnabled,
    chimeEnabled: settings.value.chimeEnabled,
    lastMode: timerState.value.mode,
  }

  const success = saveSettingsToStorage(newSettings)

  // Success: settings.value is updated automatically, motionEnabled computed will reflect the change
  // Failure: settings.value remains unchanged, display stays consistent
  if (!success) {
    // localStorage save failed, but app continues with current in-memory state
  }
}

const handleSave = (payload: { focusMinutes: number; breakMinutes: number; motionEnabled: boolean; chimeEnabled: boolean }) => {
  const newSettings = {
    focusMinutes: payload.focusMinutes,
    breakMinutes: payload.breakMinutes,
    motionEnabled: payload.motionEnabled,
    chimeEnabled: payload.chimeEnabled,
    lastMode: timerState.value.mode,
  }

  const success = saveSettingsToStorage(newSettings)

  if (success) {
    setDurations({
      focusSec: payload.focusMinutes * 60,
      breakSec: payload.breakMinutes * 60,
    })
    closeModal()
  }
}

// Initialize durations from settings
setDurations({
  focusSec: settings.value.focusMinutes * 60,
  breakSec: settings.value.breakMinutes * 60,
})
setMode(settings.value.lastMode)

// Initialize audio
onMounted(() => {
  try {
    const audioPath = import.meta.env.BASE_URL + 'assets/sounds/chime.mp3'
    audioInstance = new Audio(audioPath)
    audioInstance.preload = 'auto'
  } catch (err) {
    console.debug('Failed to load chime audio:', err)
  }
})

// Set up time-up callback
setOnTimeUp(() => {
  playChime()
})

// Update document title
watchEffect(() => {
  const timeStr = formatMMSS(timerState.value.remainingSec)
  const modeStr = timerState.value.mode === 'focus' ? 'Focus' : 'Break'
  document.title = `${timeStr} - ${modeStr} | Pomotoma`
})
</script>

<style scoped>
.timer-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.container {
  width: 100%;
  max-width: 500px;
  position: relative;
}

/* Settings Button */
.settings-button {
  position: absolute;
  top: 0;
  left: 0;
  background: transparent;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
  padding: var(--spacing-sm);
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.settings-button:hover {
  opacity: 1;
}

/* Motion Toggle */
.motion-toggle {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  transition: all var(--transition-base);
}

.motion-toggle:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
}

/* Mode Tabs */
.mode-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.mode-tab {
  flex: 1;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.mode-tab:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
}

.mode-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-surface);
}

.mode-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Timer Display */
.timer-display {
  text-align: center;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xl);
  font-variant-numeric: tabular-nums;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .timer-display {
    font-size: var(--font-size-3xl);
  }

  .motion-toggle {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs);
  }
}
</style>
