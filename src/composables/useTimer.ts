import { ref } from 'vue'
import type { TimerMode, TimerState } from '../types/timer'

const DEFAULT_FOCUS_SEC = 25 * 60
const DEFAULT_BREAK_SEC = 5 * 60

export function formatMMSS(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec))
  const minutes = Math.floor(sec / 60)
  const seconds = sec % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function useTimer() {
  const durations = ref({
    focusSec: DEFAULT_FOCUS_SEC,
    breakSec: DEFAULT_BREAK_SEC,
  })

  const state = ref<TimerState>({
    mode: 'focus',
    status: 'idle',
    durationSec: DEFAULT_FOCUS_SEC,
    remainingSec: DEFAULT_FOCUS_SEC,
  })

  let intervalId: ReturnType<typeof setInterval> | null = null
  let onTimeUpCallback: (() => void) | null = null

  const stopInterval = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const tick = () => {
    if (state.value.status !== 'running' || state.value.startedAtEpochMs === undefined) {
      return
    }

    const now = Date.now()
    const elapsed = now - state.value.startedAtEpochMs
    const elapsedSec = Math.floor(elapsed / 1000)
    const remaining = state.value.durationSec - elapsedSec

    if (remaining <= 0) {
      state.value.remainingSec = 0
      state.value.status = 'idle'
      state.value.startedAtEpochMs = undefined
      stopInterval()

      if (onTimeUpCallback) {
        onTimeUpCallback()
      }
    } else {
      state.value.remainingSec = remaining
    }
  }

  const start = () => {
    if (state.value.status !== 'idle') {
      return
    }

    state.value.status = 'running'
    state.value.startedAtEpochMs = Date.now()
    state.value.pausedAtEpochMs = undefined

    stopInterval()
    intervalId = setInterval(tick, 1000)
  }

  const pause = () => {
    if (state.value.status !== 'running') {
      return
    }

    tick()

    state.value.status = 'paused'
    state.value.pausedAtEpochMs = Date.now()
    stopInterval()
  }

  const resume = () => {
    if (state.value.status !== 'paused' || state.value.pausedAtEpochMs === undefined) {
      return
    }

    const pauseDuration = Date.now() - state.value.pausedAtEpochMs
    if (state.value.startedAtEpochMs !== undefined) {
      state.value.startedAtEpochMs += pauseDuration
    }

    state.value.status = 'running'
    state.value.pausedAtEpochMs = undefined

    stopInterval()
    intervalId = setInterval(tick, 1000)
  }

  const reset = () => {
    stopInterval()

    state.value.status = 'idle'
    state.value.remainingSec = state.value.durationSec
    state.value.startedAtEpochMs = undefined
    state.value.pausedAtEpochMs = undefined
  }

  const skip = () => {
    stopInterval()

    const nextMode: TimerMode = state.value.mode === 'focus' ? 'break' : 'focus'
    const nextDuration = nextMode === 'focus' ? durations.value.focusSec : durations.value.breakSec

    state.value.mode = nextMode
    state.value.status = 'idle'
    state.value.durationSec = nextDuration
    state.value.remainingSec = nextDuration
    state.value.startedAtEpochMs = undefined
    state.value.pausedAtEpochMs = undefined
  }

  const setMode = (mode: TimerMode) => {
    if (state.value.status !== 'idle') {
      return
    }

    const nextDuration = mode === 'focus' ? durations.value.focusSec : durations.value.breakSec

    state.value.mode = mode
    state.value.durationSec = nextDuration
    state.value.remainingSec = nextDuration
  }

  const setDurations = (newDurations: { focusSec: number; breakSec: number }) => {
    durations.value = { ...newDurations }

    if (state.value.status === 'idle') {
      const nextDuration = state.value.mode === 'focus' ? newDurations.focusSec : newDurations.breakSec
      state.value.durationSec = nextDuration
      state.value.remainingSec = nextDuration
    }
  }

  const setOnTimeUp = (callback: () => void) => {
    onTimeUpCallback = callback
  }

  return {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    setMode,
    setDurations,
    setOnTimeUp,
  }
}
