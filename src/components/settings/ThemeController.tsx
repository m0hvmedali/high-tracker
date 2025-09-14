import { useSettings, type ThemeMode } from '@/stores/settings'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ThemeController() {
  const theme = useSettings((s) => s.theme)
  const tokens = useSettings((s) => s.tokens)
  const setTheme = useSettings((s) => s.setTheme)
  const setTokens = useSettings((s) => s.setTokens)

  const onColor = (k: 'primary'|'secondary'|'accent') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokens({ [k]: e.target.value } as any)
  }

  return (
    <section className="rounded-lg border p-4 space-y-4">
      <h2 className="font-medium">Theme</h2>
      <div className="grid sm:grid-cols-2 gap-3 items-center">
        <label>Mode</label>
        <Select value={theme} onValueChange={(v: ThemeMode) => setTheme(v)}>
          <SelectTrigger><SelectValue placeholder="Theme" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="high-contrast">High Contrast</SelectItem>
          </SelectContent>
        </Select>
        <label>Primary</label>
        <Input type="color" value={tokens.primary} onChange={onColor('primary')} />
        <label>Secondary</label>
        <Input type="color" value={tokens.secondary} onChange={onColor('secondary')} />
        <label>Accent</label>
        <Input type="color" value={tokens.accent} onChange={onColor('accent')} />
      </div>
    </section>
  )
}
