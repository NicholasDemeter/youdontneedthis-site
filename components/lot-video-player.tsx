'use client'

import { useState } from 'react'

interface LotVideoPlayerProps {
  videoUrl: string
  productName: string
}

export function LotVideoPlayer({ videoUrl, productName }: LotVideoPlayerProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Product Video</h2>
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
        <video
          controls
          preload="metadata"
          className="w-full h-full"
          onError={() => setHasError(true)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}
