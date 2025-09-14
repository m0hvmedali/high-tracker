import { useSettings } from '@/stores/settings'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export function AccessibilityControls() {
  const a = useSettings((s) => s.accessibility)
  const setA = useSettings((s) => s.setAccessibility)

  return (
    <section className="rounded-lg border p-4 space-y-4">
      <h2 className="font-medium">Accessibility</h2>
      <div className="grid gap-4">
        <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
          <label>Font size: {a.fontSize}%</label>
          <Slider min={80} max={150} step={5} value={[a.fontSize]} onValueChange={([v]) => setA({ fontSize: v })} />
        </div>
        <div className="flex items-center justify-between">
          <label>Reduce motion</label>
          <Switch checked={a.reducedMotion} onCheckedChange={(v) => setA({ reducedMotion: v })} />
        </div>
        <div className="flex items-center justify-between">
          <label>Captions default</label>
          <Switch checked={a.captionsDefault} onCheckedChange={(v) => setA({ captionsDefault: v })} />
        </div>
        <div className="flex items-center justify-between">
          <label>Text-to-Speech</label>
          <Switch checked={a.ttsEnabled} onCheckedChange={(v) => setA({ ttsEnabled: v })} />
        </div>
      </div>
    </section>
  )
}
