export function Pin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.5c-3.3 0-6 2.5-6 5.9 0 2.7 2.1 4.9 4.3 6.4L12 21l1.7-5.2c2.2-1.5 4.3-3.7 4.3-6.4 0-3.4-2.7-5.9-6-5.9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.2" r="2.1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
