<template>
  <div class="timer-page">
    <div class="container">
      <!-- Settings Button (Top Left) -->
      <button class="settings-button" @click="openModal">⚙️</button>

      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button
          class="mode-tab"
          :class="{ active: timerState.mode === 'focus' }"
          :disabled="timerState.status !== 'idle'"
          @click="() => setMode('focus')"
        >
          Focus
        </button>
        <button
          class="mode-tab"
          :class="{ active: timerState.mode === 'break' }"
          :disabled="timerState.status !== 'idle'"
          @click="() => setMode('break')"
        >
          Break
        </button>
      </div>

      <!-- Character Stage (Placeholder) -->
      <div class="character-stage">
        <div class="character-placeholder">
          <template v-if="motionEnabled">
            {{ timerState.mode === 'focus' ? '🍅' : '🐱' }}
          </template>
          <template v-else>
            {{ timerState.mode === 'focus' ? '🍅💤' : '🐱💤' }}
          </template>
        </div>
      </div>

      <!-- Timer Display -->
      <div class="timer-display">
        {{ formatMMSS(timerState.remainingSec) }}
      </div>

      <!-- Controls -->
      <div class="controls">
        <button
          v-if="timerState.status === 'idle'"
          class="control-button primary"
          @click="start"
        >
          Start
        </button>

        <button
          v-if="timerState.status === 'running'"
          class="control-button"
          @click="pause"
        >
          Pause
        </button>

        <button
          v-if="timerState.status === 'paused'"
          class="control-button primary"
          @click="resume"
        >
          Resume
        </button>

        <button
          v-if="timerState.status !== 'idle'"
          class="control-button"
          @click="reset"
        >
          Reset
        </button>

        <button
          class="control-button"
          @click="skip"
        >
          Skip
        </button>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-panel" @click.stop>
        <h2 class="modal-title">Settings</h2>

        <div class="modal-body">
          <div class="form-group">
            <label for="focus-minutes">Focus (minutes)</label>
            <input
              id="focus-minutes"
              v-model.number="formData.focusMinutes"
              type="number"
              min="1"
              max="99"
            />
          </div>

          <div class="form-group">
            <label for="break-minutes">Break (minutes)</label>
            <input
              id="break-minutes"
              v-model.number="formData.breakMinutes"
              type="number"
              min="1"
              max="99"
            />
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="formData.motionEnabled"
                type="checkbox"
              />
              <span class="checkbox-label">Enable Motion</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="modal-button"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            class="modal-button primary"
            :disabled="timerState.status !== 'idle'"
            @click="saveSettings"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from 'vue'
import { useTimer, formatMMSS } from '../composables/useTimer'
import { useSettings } from '../composables/useSettings'

const { state: timerState, start, pause, resume, reset, skip, setMode, setDurations } = useTimer()
const { settings, save: saveSettingsToStorage } = useSettings()

const motionEnabled = computed(() => settings.value.motionEnabled)

const isModalOpen = ref(false)
const formData = reactive({
  focusMinutes: settings.value.focusMinutes,
  breakMinutes: settings.value.breakMinutes,
  motionEnabled: settings.value.motionEnabled,
})

const openModal = () => {
  formData.focusMinutes = settings.value.focusMinutes
  formData.breakMinutes = settings.value.breakMinutes
  formData.motionEnabled = settings.value.motionEnabled
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveSettings = () => {
  const newSettings = {
    focusMinutes: formData.focusMinutes,
    breakMinutes: formData.breakMinutes,
    motionEnabled: formData.motionEnabled,
    lastMode: timerState.value.mode,
  }

  const success = saveSettingsToStorage(newSettings)

  if (success) {
    setDurations({
      focusSec: formData.focusMinutes * 60,
      breakSec: formData.breakMinutes * 60,
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

/* Character Stage */
.character-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  min-height: 200px;
}

.character-placeholder {
  font-size: 120px;
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

/* Controls */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
}

.control-button {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 100px;
}

.control-button:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-dark);
}

.control-button.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-surface);
}

.control-button.primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  z-index: var(--z-modal);
}

.modal-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-xl);
}

.modal-title {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-lg);
}

.modal-body {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.form-group input[type="number"] {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
}

.form-group input[type="checkbox"] {
  margin-right: var(--spacing-sm);
}

.checkbox-label {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.modal-footer {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.modal-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.modal-button:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-dark);
}

.modal-button.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-surface);
}

.modal-button.primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.modal-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .timer-display {
    font-size: var(--font-size-3xl);
  }

  .character-placeholder {
    font-size: 80px;
  }

  .control-button {
    min-width: 80px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
