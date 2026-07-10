export function WaveDivider({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        className={`h-4 w-full max-w-xs ${tone === "dark" ? "text-forest-700" : "text-earth-300"}`}
        aria-hidden
      >
        <path
          d="M0 8c8-6 16-6 25 0s17 6 25 0 16-6 25 0 17 6 25 0 16-6 25 0 17 6 25 0 16-6 25 0 17 6 25 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
