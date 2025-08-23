import type { PropsWithChildren } from 'react'

export default function MotionSafe({ children }: PropsWithChildren) {
  return <div className="motion-safe">{children}</div>
}
