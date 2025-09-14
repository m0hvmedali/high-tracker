import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

export function DiagramCarousel({ lessonId }: { lessonId: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 font-medium">Diagrams</div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2].map((i) => (
          <TransformWrapper key={i}>
            <TransformComponent>
              <img src="/vite.svg" alt={`Diagram ${i}`} className="w-full h-48 object-contain bg-muted rounded" />
            </TransformComponent>
          </TransformWrapper>
        ))}
      </div>
    </div>
  )
}
