import MiniSearch, { SearchOptions } from 'minisearch'

export type SearchDoc = { id: string; title: string; description?: string; tags?: string[]; type: 'subject'|'section'|'lesson' }

let mini: MiniSearch<SearchDoc> | null = null

export function initSearch(docs: SearchDoc[]) {
  mini = new MiniSearch<SearchDoc>({ fields: ['title', 'description', 'tags'], storeFields: ['title','description','tags','type'] })
  mini.addAll(docs)
}

export function search(q: string, opts?: SearchOptions) {
  if (!mini) return []
  return mini.search(q, { prefix: true, fuzzy: 0.2, ...opts })
}
