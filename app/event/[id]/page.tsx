import { Suspense } from "react"
import EventContent from "./event-content"

export default function EventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <EventContent />
    </Suspense>
  )
}
