import { ThemeController } from './ThemeController'
import { AccessibilityControls } from './AccessibilityControls'
import { ImportExportSettings } from './ImportExportSettings'

export function SettingsPanel() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <ThemeController />
      <AccessibilityControls />
      <ImportExportSettings />
    </div>
  )
}
