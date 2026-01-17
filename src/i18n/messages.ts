export type Messages = {
  'app.title': string
  'mode.focus': string
  'mode.break': string
  'button.start': string
  'button.pause': string
  'button.resume': string
  'button.reset': string
  'button.skip': string
  'settings.title': string
  'settings.focusMinutes': string
  'settings.breakMinutes': string
  'settings.enableMotion': string
  'settings.enableChime': string
  'settings.autoSwitch': string
  'settings.language': string
  'settings.languageJa': string
  'settings.languageEn': string
  'about.title': string
  'about.description1': string
  'about.description2': string
  'common.save': string
  'common.cancel': string
  'motion.on': string
  'motion.off': string
}

export const messages: Record<'ja' | 'en', Messages> = {
  ja: {
    'app.title': 'Pomotoma',
    'mode.focus': '集中',
    'mode.break': '休憩',
    'button.start': '開始',
    'button.pause': '一時停止',
    'button.resume': '再開',
    'button.reset': 'リセット',
    'button.skip': 'スキップ',
    'settings.title': '設定',
    'settings.focusMinutes': '集中（分）',
    'settings.breakMinutes': '休憩（分）',
    'settings.enableMotion': 'モーション',
    'settings.enableChime': 'チャイム',
    'settings.autoSwitch': '自動切替（集中→休憩）',
    'settings.language': '言語',
    'settings.languageJa': '日本語',
    'settings.languageEn': 'English',
    'about.title': 'このアプリについて',
    'about.description1': 'ポモドーロ・テクニックは時間管理法の一つです。25分間集中し、その後5分間の短い休憩を取ります。',
    'about.description2': '集中時間や休憩時間の長さは、設定で調整できます。',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'motion.on': 'オン',
    'motion.off': 'オフ',
  },
  en: {
    'app.title': 'Pomotoma',
    'mode.focus': 'Focus',
    'mode.break': 'Break',
    'button.start': 'Start',
    'button.pause': 'Pause',
    'button.resume': 'Resume',
    'button.reset': 'Reset',
    'button.skip': 'Skip',
    'settings.title': 'Settings',
    'settings.focusMinutes': 'Focus (minutes)',
    'settings.breakMinutes': 'Break (minutes)',
    'settings.enableMotion': 'Motion',
    'settings.enableChime': 'Chime',
    'settings.autoSwitch': 'Auto Switch (Focus → Break)',
    'settings.language': 'Language',
    'settings.languageJa': '日本語',
    'settings.languageEn': 'English',
    'about.title': 'About',
    'about.description1': 'Pomodoro is a time management method: Focus for 25 minutes, then take a short break.',
    'about.description2': 'You can adjust the Focus and Break lengths in Settings above.',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'motion.on': 'On',
    'motion.off': 'Off',
  },
}
