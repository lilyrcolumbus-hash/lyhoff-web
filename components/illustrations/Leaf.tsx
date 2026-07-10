export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M8 25c-2-7 .5-15 9-18.5 6-2.4 11-1 13-.5-1 4.5-3.5 12-11 16-4.5 2.3-8.5 3-11 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 25c3-6 7.5-11.5 15.5-17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
