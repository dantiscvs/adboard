// HireAds logo — angular chevron mark matching hireads.pl brand colours.

export function LogoMark({ size = 28, className = '' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="ha-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7B6FF0" />
          <stop offset="100%" stopColor="#5B4AE8" />
        </linearGradient>
      </defs>
      {/* Outer angular chevron → */}
      <path
        d="M10 8 L30 24 L10 40"
        stroke="url(#ha-grad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner accent line */}
      <path
        d="M24 18 L38 24 L24 30"
        stroke="url(#ha-grad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  )
}

export function LogoWordmark({ className = '', style }) {
  return (
    <span
      className={className}
      style={{
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: 'var(--text, #1a1b2e)',
        lineHeight: 1,
        ...style,
      }}
    >
      Hire<span style={{ color: '#5B4AE8' }}>Ads</span>
    </span>
  )
}

export default function Logo({ size = 28, textSize = '1.15rem', showText = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {showText && <LogoWordmark style={{ fontSize: textSize }} />}
    </span>
  )
}
