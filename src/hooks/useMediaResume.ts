export function useMediaResume(key: string) {
  const save = (ts: number) => localStorage.setItem(key, String(ts))
  const load = () => Number(localStorage.getItem(key) || 0)
  return { save, load }
}
