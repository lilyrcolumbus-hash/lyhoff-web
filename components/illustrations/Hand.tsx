export function Hand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M10 15V8.5a1.8 1.8 0 0 1 3.6 0V14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6 14V6.8a1.8 1.8 0 0 1 3.6 0V14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.2 14V8a1.8 1.8 0 0 1 3.6 0v8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.8 12.8a1.8 1.8 0 0 1 3.6.2v6c0 5-3.4 8.5-8 8.5-3 0-4.8-1-6.7-3.3l-4.4-5.4a1.7 1.7 0 0 1 2.5-2.3l2.2 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
