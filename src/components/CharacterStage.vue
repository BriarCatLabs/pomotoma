<template>
  <div class="character-stage">
    <picture class="character-image">
      <source
        :srcset="`/assets/characters/${imageName}.webp`"
        type="image/webp"
      />
      <img
        :src="`/assets/characters/${imageName}.png`"
        :alt="imageAlt"
        loading="lazy"
      />
    </picture>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TimerMode } from '../types/timer'

const props = defineProps<{
  mode: TimerMode
  motionEnabled: boolean
}>()

const imageName = computed(() => {
  if (props.mode === 'focus') {
    return props.motionEnabled ? 'focus-idle' : 'focus-breathing'
  } else {
    return props.motionEnabled ? 'break-idle' : 'break-sleep'
  }
})

const imageAlt = computed(() => {
  if (props.mode === 'focus') {
    return props.motionEnabled ? 'Focus mode - Idle' : 'Focus mode - Breathing'
  } else {
    return props.motionEnabled ? 'Break mode - Idle' : 'Break mode - Sleeping'
  }
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
  max-width: 100%;
  height: auto;
}

.character-image img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
}

@media (max-width: 480px) {
  .character-image img {
    max-height: 200px;
  }
}
</style>
