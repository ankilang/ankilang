import { useEffect, useRef, useState } from 'react'

type CommunityOrbitProps = {
  width?: number
  height?: number
  className?: string
  ariaLabel?: string
  paused?: boolean
}

/**
 * Illustration "Communauté orbitale"
 * - SVG 560×420 (par défaut) pour éviter le CLS
 * - Carte centrale + 6 satellites en orbite
 * - Connexions radiales + halo
 * - Animation via requestAnimationFrame (transform only)
 * - Pause au survol / focus ; réduit si prefers-reduced-motion
 */
export default function CommunityOrbit({
  width = 560,
  height = 420,
  className = '',
  ariaLabel = 'Illustration de la communauté : cartes orbitant autour d\'une carte centrale',
  paused = false,
}: CommunityOrbitProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [isReduced, setIsReduced] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const reqRef = useRef<number | null>(null)
  const t0 = useRef<number>(0)

  // Préférence utilisateur : reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setIsReduced(mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const center = { x: width / 2, y: height / 2 }

    // Paramètres d'orbite : rayons + vitesse (rad/s)
    const satellites = Array.from({ length: 6 }).map((_, i) => ({
      el: svg.querySelector<SVGGElement>(`[data-sat='${i}']`),
      r: 120 + (i % 4) * 35,          // rayons 120 / 155 / 190 / 225
      w: (i % 2 ? 0.25 : 0.15),       // vitesse différente
      phi0: (i * Math.PI) / 3,        // déphasage 60°
      line: svg.querySelector<SVGLineElement>(`[data-link='${i}']`),
    }))

    const animate = (ts: number) => {
      if (!t0.current) t0.current = ts
      const t = (ts - t0.current) / 1000 // secondes
      const active = !(paused || isHover || isReduced)

      satellites.forEach((s) => {
        if (!s.el) return
        const angle = s.phi0 + (active ? s.w * t : s.w * 0.0)
        const x = center.x + s.r * Math.cos(angle)
        const y = center.y + s.r * Math.sin(angle)
        s.el.setAttribute('transform', `translate(${x}, ${y})`)
        if (s.line) {
          s.line.setAttribute('x1', String(center.x))
          s.line.setAttribute('y1', String(center.y))
          s.line.setAttribute('x2', String(x))
          s.line.setAttribute('y2', String(y))
        }
      })

      // Animation infinie - toujours continuer
      reqRef.current = requestAnimationFrame(animate)
    }

    reqRef.current = requestAnimationFrame(animate)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [width, height, paused, isHover, isReduced])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox="0 0 560 420"
      role="img"
      aria-label={ariaLabel}
      className={`w-full h-auto select-none ${className}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onFocus={() => setIsHover(true)}
      onBlur={() => setIsHover(false)}
    >
      <defs>
        <linearGradient id="co-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(258 90% 66% / 0.16)" />
          <stop offset="1" stopColor="hsl(292 84% 61% / 0.12)" />
        </linearGradient>
        <linearGradient id="co-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(258 84% 65%)" />
          <stop offset="1" stopColor="hsl(210 90% 60%)" />
        </linearGradient>
        <linearGradient id="co-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="hsl(292 84% 61%)" />
          <stop offset="1" stopColor="hsl(258 84% 65%)" />
        </linearGradient>
        <filter id="co-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
          <feOffset dx="0" dy="2" result="o" />
          <feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* fond doux + grille subtile */}
      <rect x="0" y="0" width="560" height="420" rx="24" fill="url(#co-bg)" />
      <g opacity="0.05">
        <path d="M40 60H520 M40 120H520 M40 180H520 M40 240H520 M40 300H520 M40 360H520" stroke="currentColor" strokeWidth="1"/>
        <path d="M80 40V380 M160 40V380 M240 40V380 M320 40V380 M400 40V380 M480 40V380" stroke="currentColor" strokeWidth="1"/>
      </g>

      {/* halo central */}
      <g opacity="0.35">
        <circle cx="280" cy="210" r="120" fill="hsl(258 90% 66% / 0.20)" />
        <circle cx="280" cy="210" r="80"  fill="hsl(292 84% 61% / 0.18)" />
      </g>

      {/* connexions radiales (maj en anim) */}
      {Array.from({ length: 6 }).map((_, i) => {
        const r = 120 + (i % 4) * 35
        const phi0 = (i * Math.PI) / 3
        const x2 = 280 + r * Math.cos(phi0)
        const y2 = 210 + r * Math.sin(phi0)
        return (
          <line key={i} data-link={i} x1="280" y1="210" x2={x2} y2={y2} stroke="hsl(220 10% 70% / 0.6)" strokeWidth="1.25" />
        )
      })}

      {/* carte centrale */}
      <g filter="url(#co-soft)">
        <rect x="220" y="165" width="120" height="90" rx="12" fill="white" className="dark:fill-slate-900" />
        <rect x="236" y="185" width="72" height="10" rx="5" fill="hsl(220 10% 80%)" className="dark:fill-slate-600" />
        <rect x="236" y="201" width="96" height="8" rx="4" fill="hsl(220 10% 86%)" className="dark:fill-slate-700" />
        <rect x="236" y="215" width="84" height="8" rx="4" fill="hsl(220 10% 92%)" className="dark:fill-slate-800" />
      </g>

      {/* satellites (maj en anim via transform) */}
      {Array.from({ length: 6 }).map((_, i) => {
        const r = 120 + (i % 4) * 35
        const phi0 = (i * Math.PI) / 3
        const x = 280 + r * Math.cos(phi0)
        const y = 210 + r * Math.sin(phi0)
        return (
          <g key={i} data-sat={i} transform={`translate(${x},${y})`}>
            <g filter="url(#co-soft)">
              <rect x="-26" y="-18" width="52" height="36" rx="8" fill={
                i === 0 ? 'url(#co-a)' : 
                i === 1 ? 'url(#co-b)' : 
                i === 2 ? 'hsl(210, 90%, 60%)' :
                i === 3 ? 'url(#co-a)' :
                i === 4 ? 'url(#co-b)' :
                'hsl(210, 90%, 60%)'
              } />
              <rect x="-16" y="-6" width="28" height="6" rx="3" fill="white" opacity="0.9" />
              <rect x="-16" y="4"  width="36" height="5" rx="2.5" fill="white" opacity="0.8" />
            </g>
          </g>
        )
      })}
    </svg>
  )
}
