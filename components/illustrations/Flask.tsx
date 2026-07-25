export function Flask({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M13 4.5h6v7.4l6 13a2.4 2.4 0 0 1-2.2 3.4H9.2A2.4 2.4 0 0 1 7 24.9l6-13V4.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 4.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M10.3 20.5c2.3 1 5.4 1 7.7-.3 2.3-1.3 5-1.3 6.8 0"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
