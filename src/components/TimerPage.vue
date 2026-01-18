<template>
  <div class="timer-page">
    <div class="container">
      <!-- Settings Button (Top Left) -->
      <button type="button" class="settings-button" @click="openModal">⚙️</button>

      <!-- Motion Toggle (Top Right) -->
      <button type="button" class="motion-toggle" @click="toggleMotion">
        {{ t('settings.enableMotion') }}: {{ motionEnabled ? t('motion.on') : t('motion.off') }}
      </button>

      <!-- Illustration Toggle (Below Motion Toggle) -->
      <button type="button" class="illustration-toggle" @click="toggleIllustration">
        {{ t('settings.enableIllustration') }}: {{ illustrationEnabled ? t('illustration.on') : t('illustration.off') }}
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
          {{ t('mode.focus') }}
        </button>
        <button
          type="button"
          class="mode-tab"
          :class="{ active: timerState.mode === 'break' }"
          :disabled="timerState.status !== 'idle'"
          @click="() => setMode('break')"
        >
          {{ t('mode.break') }}
        </button>
      </div>

      <!-- Character Stage with Timer (when illustration is enabled) -->
      <template v-if="illustrationEnabled">
        <CharacterStage
          :mode="timerState.mode"
          :status="timerState.status"
          :motion-enabled="motionEnabled"
        />

        <!-- Timer Display -->
        <div class="timer-display">
          {{ formatMMSS(timerState.remainingSec) }}
        </div>
      </template>

      <!-- Focus Timer Display (when illustration is disabled) -->
      <template v-else>
        <div class="focus-timer-display">
          {{ formatMMSS(timerState.remainingSec) }}
        </div>
      </template>

      <!-- Controls -->
      <TimerControls
        :key="`controls-${settings.language}`"
        :status="timerState.status"
        :t="t"
        @start="start"
        @pause="pause"
        @resume="resume"
        @reset="reset"
        @skip="skip"
      />
    </div>

    <!-- Settings Modal -->
    <SettingsModal
      :key="`modal-${settings.language}`"
      :open="isModalOpen"
      :status="timerState.status"
      :initial-focus-minutes="settings.focusMinutes"
      :initial-break-minutes="settings.breakMinutes"
      :initial-motion-enabled="settings.motionEnabled"
      :initial-chime-enabled="settings.chimeEnabled"
      :initial-auto-switch-enabled="settings.autoSwitchEnabled"
      :initial-illustration-enabled="settings.illustrationEnabled"
      :initial-language="settings.language"
      :t="t"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useTimer, formatMMSS } from '../composables/useTimer'
import { useSettings } from '../composables/useSettings'
import { useI18n } from '../i18n/useI18n'
import CharacterStage from './CharacterStage.vue'
import TimerControls from './TimerControls.vue'
import SettingsModal from './SettingsModal.vue'

const { state: timerState, start: timerStart, pause, resume: timerResume, reset, skip: timerSkip, setMode, setDurations, setOnTimeUp } = useTimer()
const { settings, save: saveSettingsToStorage } = useSettings()
const languageRef = computed(() => settings.value.language)
const { t } = useI18n(languageRef)

const motionEnabled = computed(() => settings.value.motionEnabled)
const chimeEnabled = computed(() => settings.value.chimeEnabled)
const illustrationEnabled = computed(() => settings.value.illustrationEnabled)

let audioInstance: HTMLAudioElement | null = null
let chimeStopTimerId: ReturnType<typeof setTimeout> | null = null

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

  // Clear existing stop timer if any
  if (chimeStopTimerId !== null) {
    clearTimeout(chimeStopTimerId)
    chimeStopTimerId = null
  }

  try {
    audioInstance.currentTime = 0
    const playPromise = audioInstance.play()
    if (playPromise) {
      playPromise.then(() => {
        // Stop chime after 3 seconds
        chimeStopTimerId = setTimeout(() => {
          if (audioInstance) {
            audioInstance.pause()
            audioInstance.currentTime = 0
          }
          chimeStopTimerId = null
        }, 3000)
      }).catch((err) => {
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
    autoSwitchEnabled: settings.value.autoSwitchEnabled,
    illustrationEnabled: settings.value.illustrationEnabled,
    lastMode: timerState.value.mode,
    language: settings.value.language,
  }

  const success = saveSettingsToStorage(newSettings)

  // Success: settings.value is updated automatically, motionEnabled computed will reflect the change
  // Failure: settings.value remains unchanged, display stays consistent
  if (!success) {
    // localStorage save failed, but app continues with current in-memory state
  }
}

const toggleIllustration = () => {
  const newSettings = {
    focusMinutes: settings.value.focusMinutes,
    breakMinutes: settings.value.breakMinutes,
    motionEnabled: settings.value.motionEnabled,
    chimeEnabled: settings.value.chimeEnabled,
    autoSwitchEnabled: settings.value.autoSwitchEnabled,
    illustrationEnabled: !settings.value.illustrationEnabled,
    lastMode: timerState.value.mode,
    language: settings.value.language,
  }

  const success = saveSettingsToStorage(newSettings)

  // Success: settings.value is updated automatically, illustrationEnabled computed will reflect the change
  // Failure: settings.value remains unchanged, display stays consistent
  if (!success) {
    // localStorage save failed, but app continues with current in-memory state
  }
}

const handleSave = (payload: { focusMinutes: number; breakMinutes: number; motionEnabled: boolean; chimeEnabled: boolean; autoSwitchEnabled: boolean; illustrationEnabled: boolean; language: 'ja' | 'en' }) => {
  const newSettings = {
    focusMinutes: payload.focusMinutes,
    breakMinutes: payload.breakMinutes,
    motionEnabled: payload.motionEnabled,
    chimeEnabled: payload.chimeEnabled,
    autoSwitchEnabled: payload.autoSwitchEnabled,
    illustrationEnabled: payload.illustrationEnabled,
    lastMode: timerState.value.mode,
    language: payload.language,
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
// TimeUp処理:
// 1. チャイムを鳴らす（chimeEnabled=trueの場合、最大3秒で自動停止）
// 2. autoSwitchEnabled=trueの場合のみ、skip()を呼んで次モードへ切り替える
//    （切り替え後はstatus='idle'のまま、自動でstartはしない）
setOnTimeUp(() => {
  playChime()

  if (settings.value.autoSwitchEnabled) {
    timerSkip()
    // 次モードを自動開始
    timerStart()
  }
})

// Update document title
watchEffect(() => {
  const timeStr = formatMMSS(timerState.value.remainingSec)
  const modeKey = timerState.value.mode === 'focus' ? 'mode.focus' : 'mode.break'
  const modeStr = t(modeKey)
  document.title = `${timeStr} - ${modeStr} | ${t('app.title')}`
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

/* Illustration Toggle */
.illustration-toggle {
  position: absolute;
  top: calc(var(--spacing-md) + var(--spacing-xl));
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

.illustration-toggle:hover {
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

/* Focus Timer Display (when illustration is hidden) */
.focus-timer-display {
  text-align: center;
  font-size: 6rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: var(--spacing-3xl) 0;
  font-variant-numeric: tabular-nums;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .timer-display {
    font-size: var(--font-size-3xl);
  }

  .focus-timer-display {
    font-size: 4rem;
    min-height: 200px;
  }

  .motion-toggle,
  .illustration-toggle {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs);
  }
}
</style>
