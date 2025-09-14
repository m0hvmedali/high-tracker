import { db } from './IndexedDBService'
import { useSettings } from '@/stores/settings'

export const ImportExportService = {
  async exportJSON() {
    const settings = useSettings.getState()
    const [notes, progress, content] = await Promise.all([
      db.notes.toArray(),
      db.progress.toArray(),
      db.content.toArray(),
    ])
    const data = { version: '1.0.0', settings, notes, progress, content }
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  },
  async importJSON(jsonText: string) {
    const data = JSON.parse(jsonText)
    if (data.settings) {
      const s = useSettings.getState()
      s.setTheme(data.settings.theme)
      s.setLocale(data.settings.locale)
      s.setTokens(data.settings.tokens)
      s.setAccessibility(data.settings.accessibility)
    }
    if (Array.isArray(data.notes)) await db.notes.bulkPut(data.notes)
    if (Array.isArray(data.progress)) await db.progress.bulkPut(data.progress)
    if (Array.isArray(data.content)) await db.content.bulkPut(data.content)
  },
}
