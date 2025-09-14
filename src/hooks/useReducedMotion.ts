import { useSettings } from '@/stores/settings'

export function useReducedMotion() {
  return useSettings((s) => s.accessibility.reducedMotion)
}
