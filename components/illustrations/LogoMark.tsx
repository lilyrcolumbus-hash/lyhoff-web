// The LF monogram — exact approved frame geometry (130-unit viewBox): square
// inset at 6/124, gap centered on the TOP edge only (57.5–72.5), thick
// "rooted" bottom overlay. Round caps/joins are a deliberate exception to the
// site's usual square-corners rule, kept for this one mark. See
// reference_lf_monogram_frame_spec (Claude memory) for the source spec.
export function LogoMark({
  className = "",
  textClassName = "text-lg",
}: {
  className?: string
  textClassName?: string
}) {
  return (
    <span className={`relative inline-block ${className}`} aria-label="LYHOFF">
      <svg viewBox="0 0 130 130" fill="none" className="h-full w-full" aria-hidden>
        <path
          d="M72.5,6 L124,6 L124,124 L6,124 L6,6 L57.5,6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6,124 L124,124"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-display absolute inset-0 flex items-center justify-center font-bold ${textClassName}`}
        style={{ letterSpacing: "-0.04em" }}
      >
        LF
      </span>
    </span>
  );
}
