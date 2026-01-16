import type { Ref } from 'vue'
import { messages, type Messages } from './messages'

export function useI18n(languageRef: Ref<'ja' | 'en'>) {
  const t = (key: keyof Messages): string => {
    const lang = languageRef.value
    const dict = messages[lang]
    return dict[key] || messages.en[key] || key
  }

  return { t }
}
