export function Jar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M11 4.5h10v3.2c2.6.6 4.3 2.7 4.3 5.6v11.2a3 3 0 0 1-3 3H9.7a3 3 0 0 1-3-3V13.3c0-2.9 1.7-5 4.3-5.6V4.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 4.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M8 17.5c2.7 1.1 5.3 1.1 8 0s5.3-1.1 8 0"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
