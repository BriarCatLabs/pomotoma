<template>
  <div v-if="open" class="modal-overlay" @click="$emit('close')">
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
          type="button"
          class="modal-button"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="modal-button primary"
          :disabled="status !== 'idle'"
          @click="handleSave"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { TimerStatus } from '../types/timer'

const props = defineProps<{
  open: boolean
  status: TimerStatus
  initialFocusMinutes: number
  initialBreakMinutes: number
  initialMotionEnabled: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { focusMinutes: number; breakMinutes: number; motionEnabled: boolean }]
}>()

const formData = reactive({
  focusMinutes: props.initialFocusMinutes,
  breakMinutes: props.initialBreakMinutes,
  motionEnabled: props.initialMotionEnabled,
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    formData.focusMinutes = props.initialFocusMinutes
    formData.breakMinutes = props.initialBreakMinutes
    formData.motionEnabled = props.initialMotionEnabled
  }
})

const handleSave = () => {
  emit('save', {
    focusMinutes: formData.focusMinutes,
    breakMinutes: formData.breakMinutes,
    motionEnabled: formData.motionEnabled,
  })
}
</script>

<style scoped>
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
</style>
