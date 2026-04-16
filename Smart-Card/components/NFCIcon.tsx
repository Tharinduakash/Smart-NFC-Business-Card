export function NFCIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Wave lines radiating from left */}
      <path d="M5 12c0-1.657 1.343-3 3-3v0" />
      <path d="M5 12c0-3.314 2.686-6 6-6v0" />
      <path d="M5 12c0-4.971 4.029-9 9-9v0" />
      {/* Right side curved lines */}
      <path d="M19 12c0-1.657-1.343-3-3-3v0" />
      <path d="M19 12c0-3.314-2.686-6-6-6v0" />
      <path d="M19 12c0-4.971-4.029-9-9-9v0" />
    </svg>
  )
}
