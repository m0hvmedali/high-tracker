import { Button } from '@/components/ui/button'
import { ImportExportService } from '@/services/ImportExportService'

export function ImportExportSettings() {
  const exportData = async () => {
    const blob = await ImportExportService.exportJSON()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'settings-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const importData = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      await ImportExportService.importJSON(text)
      location.reload()
    }
    input.click()
  }
  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h2 className="font-medium">Import / Export</h2>
      <div className="flex gap-2">
        <Button onClick={exportData}>Export JSON</Button>
        <Button variant="outline" onClick={importData}>Import JSON</Button>
      </div>
    </section>
  )
}
