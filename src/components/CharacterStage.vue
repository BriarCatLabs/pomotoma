<template>
  <div class="character-stage">
    <div class="character-placeholder">
      <template v-if="motionEnabled">
        {{ mode === 'focus' ? '🍅' : '🐱' }}
      </template>
      <template v-else>
        {{ mode === 'focus' ? '🍅💤' : '🐱💤' }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimerMode } from '../types/timer'

defineProps<{
  mode: TimerMode
  motionEnabled: boolean
}>()
</script>

<style scoped>
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

@media (max-width: 480px) {
  .character-placeholder {
    font-size: 80px;
  }
}
</style>
