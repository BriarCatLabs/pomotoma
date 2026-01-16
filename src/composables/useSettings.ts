import { ref } from 'vue'
import type { Settings } from '../types/timer'
import { safeReadJson, safeWriteJson } from '../utils/storage'

export const SETTINGS_KEY = 'pomotoma.settings'

export function getDefaultSettings(): Settings {
  return {
    focusMinutes: 25,
    breakMinutes: 5,
    motionEnabled: true,
    chimeEnabled: true,
    autoSwitchEnabled: true,
    lastMode: 'focus',
    language: 'ja',
  }
}

export function sanitizeSettings(input: Partial<Settings> | null | undefined): Settings {
  const defaults = getDefaultSettings()

  if (!input) {
    return defaults
  }

  const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return fallback
    }
    const intValue = Math.floor(value)
    if (intValue < min || intValue > max) {
      return fallback
    }
    return intValue
  }

  return {
    focusMinutes: clamp(input.focusMinutes, 1, 99, defaults.focusMinutes),
    breakMinutes: clamp(input.breakMinutes, 1, 99, defaults.breakMinutes),
    motionEnabled: typeof input.motionEnabled === 'boolean' ? input.motionEnabled : defaults.motionEnabled,
    chimeEnabled: typeof input.chimeEnabled === 'boolean' ? input.chimeEnabled : defaults.chimeEnabled,
    autoSwitchEnabled: typeof input.autoSwitchEnabled === 'boolean' ? input.autoSwitchEnabled : defaults.autoSwitchEnabled,
    lastMode: input.lastMode === 'focus' || input.lastMode === 'break' ? input.lastMode : defaults.lastMode,
    language: input.language === 'ja' || input.language === 'en' ? input.language : defaults.language,
  }
}

export function useSettings() {
  const settings = ref<Settings>(getDefaultSettings())

  const load = () => {
    const stored = safeReadJson<Partial<Settings>>(SETTINGS_KEY)
    settings.value = sanitizeSettings(stored)
  }

  const save = (next: Settings): boolean => {
    const sanitized = sanitizeSettings(next)
    settings.value = sanitized
    return safeWriteJson(SETTINGS_KEY, sanitized)
  }

  load()

  return {
    settings,
    load,
    save,
  }
}
