export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function safeReadJson<T>(key: string): T | null {
  try {
    const item = safeGetItem(key)
    if (item === null) {
      return null
    }
    return JSON.parse(item) as T
  } catch {
    return null
  }
}

export function safeWriteJson(key: string, value: unknown): boolean {
  try {
    const json = JSON.stringify(value)
    return safeSetItem(key, json)
  } catch {
    return false
  }
}
