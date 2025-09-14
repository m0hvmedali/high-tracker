import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

export function PDFViewer({ lessonId }: { lessonId: string }) {
  const [numPages, setNumPages] = useState<number | null>(null)
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 font-medium">PDF</div>
      <Document file="/sample.pdf" onLoadSuccess={(p) => setNumPages(p.numPages)}>
        <Page pageNumber={1} width={800} renderTextLayer={false} renderAnnotationLayer={false} />
      </Document>
      {numPages ? <div className="text-sm text-muted-foreground">Pages: {numPages}</div> : null}
    </div>
  )
}
