export type TimerMode = 'focus' | 'break'

export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  durationSec: number
  remainingSec: number
  startedAtEpochMs?: number
  pausedAtEpochMs?: number
}

export interface Settings {
  focusMinutes: number
  breakMinutes: number
  motionEnabled: boolean
  lastMode: TimerMode
}
