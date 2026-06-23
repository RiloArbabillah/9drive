interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 44, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="9Drive"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#logo-bg)" />
      <text
        x="256"
        y="370"
        fontFamily="'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
        fontSize="340"
        fontWeight="900"
        fill="url(#logo-accent)"
        textAnchor="middle"
      >
        9
      </text>
      <path
        d="M320 120c22 0 42 9 56 24s22 36 22 57c0 42-34 76-76 76H160c-33 0-60-27-60-60s27-60 60-60c8 0 16 2 23 5"
        fill="none"
        stroke="url(#logo-accent)"
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}
