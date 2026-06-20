type Clip = 'bob' | 'wave' | 'smile'

interface MascotMediaProps {
  clip?: Clip
  loop?: boolean
  className?: string
}

// The mascot is a transparent PNG sprite animated with CSS. (MP4 has no alpha,
// so the AI motion clips carried a baked-in background — CSS motion on the clean
// sprite stays transparent and respects prefers-reduced-motion.)
export default function MascotMedia({ clip = 'bob', className = '' }: MascotMediaProps) {
  return (
    <img
      src="/assistant/mascot.png"
      alt=""
      aria-hidden
      className={`mascot-anim mascot-${clip} ${className}`}
    />
  )
}
