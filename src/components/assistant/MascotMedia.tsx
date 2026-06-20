import { useEffect, useRef, useState } from 'react'

type Clip = 'bob' | 'wave' | 'smile'

interface MascotMediaProps {
  clip: Clip
  loop?: boolean
  className?: string
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// Animated mascot. Falls back to the static PNG when the user prefers reduced
// motion, and if a clip fails to load/decode.
export default function MascotMedia({ clip, loop = true, className }: MascotMediaProps) {
  const reduced = usePrefersReducedMotion()
  const [failed, setFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Restart the clip whenever it changes (e.g. switching to "thinking").
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [clip])

  if (reduced || failed) {
    return <img src="/assistant/mascot.png" alt="" aria-hidden className={className} />
  }

  return (
    <video
      ref={videoRef}
      className={className}
      src={`/assistant/${clip}.mp4`}
      poster="/assistant/mascot.png"
      autoPlay
      muted
      playsInline
      loop={loop}
      onError={() => setFailed(true)}
      aria-hidden
    />
  )
}
