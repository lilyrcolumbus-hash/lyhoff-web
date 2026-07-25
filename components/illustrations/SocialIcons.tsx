// Minimal single-stroke line icons, matching the hand-drawn botanical mark's
// weight (currentColor, ~1.3 stroke) rather than filled brand-logo glyphs.
type IconProps = { className?: string };

export function TikTokIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M13 3v11.2a3.3 3.3 0 1 1-2.4-3.18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 3c.4 2.6 2.1 4.3 4.6 4.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FacebookIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14.5 21v-7.2h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.2H9.4v2.8H12V21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InstagramIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.7" cy="7.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YouTubeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="6" width="18" height="12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 9.5v5l4.3-2.5-4.3-2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function PinterestIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9.8 18c.6-2.3 1.4-5.6 1.9-7.7.3-1.4 2.2-1.6 3-.5.6.8.4 1.9.1 3.1-.4 1.7.8 3 2.4 2.4 2.1-.8 2.8-3.6 1.9-5.7-1.1-2.5-4.3-3.5-6.9-2.5C9.3 8.1 8 10.8 8.8 13.1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThreadsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M8.5 8.2c1-1.4 2.6-2.2 4.3-1.9 2.6.4 3.9 2.6 3.9 5.7 0 3.6-1.8 6.2-5 6.2-2.5 0-3.9-1.4-3.9-3.1 0-2 2-3 5.3-3 2.5 0 4 .6 4.5 1.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
