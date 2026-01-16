<template>
  <div class="controls">
    <button
      v-if="status === 'idle'"
      type="button"
      class="control-button primary"
      aria-label="Start"
      title="Start"
      @click="$emit('start')"
    >
      ▶︎
    </button>

    <button
      v-if="status === 'running'"
      type="button"
      class="control-button"
      aria-label="Pause"
      title="Pause"
      @click="$emit('pause')"
    >
      ⏸
    </button>

    <button
      v-if="status === 'paused'"
      type="button"
      class="control-button primary"
      aria-label="Start"
      title="Start"
      @click="$emit('resume')"
    >
      ▶︎
    </button>

    <button
      v-if="status !== 'idle'"
      type="button"
      class="control-button"
      aria-label="Reset"
      title="Reset"
      @click="$emit('reset')"
    >
      ↺
    </button>

    <button
      type="button"
      class="control-button"
      aria-label="Skip"
      title="Skip"
      @click="$emit('skip')"
    >
      ⏭
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TimerStatus } from '../types/timer'

defineProps<{
  status: TimerStatus
}>()

defineEmits<{
  start: []
  pause: []
  resume: []
  reset: []
  skip: []
}>()
</script>

<style scoped>
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

@media (max-width: 480px) {
  .control-button {
    min-width: 80px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
