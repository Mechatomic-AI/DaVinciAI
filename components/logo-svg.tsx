export function LogoSVG({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo.svg"
      alt="DaVinci AI Logo"
      className={`w-16 h-16 hover:opacity-80 transition-opacity ${className}`}
    />
  )
}
