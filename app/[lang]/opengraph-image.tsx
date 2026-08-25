import { ImageResponse } from "next/og";

// The card people actually see when a LYHOFF link is pasted into Pinterest,
// WhatsApp or Messages. Until now there was no og:image at all — every share
// rendered as a blank grey rectangle, on the very channel that drives most of
// this site's traffic.
// Required by output: "export" — the card is generated once at build time and
// shipped as a plain PNG, not rendered per request.
export const dynamic = "force-static";

// One card per locale — the dynamic [lang] segment needs its params enumerated
// the same way every other route under it does.
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "LYHOFF — Real roots. Nothing to hide.";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbfaf7",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        {/* Same monogram geometry as app/icon.svg and LogoMark.tsx: gap centred
            on the top edge, weighted bottom edge for the "rooted" reading. */}
        <svg width="132" height="132" viewBox="0 0 130 130" fill="none">
          <path
            d="M72.5,8 L122,8 L122,122 L8,122 L8,8 L57.5,8"
            stroke="#1c1b17"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8,122 L122,122" stroke="#1c1b17" strokeWidth="7" strokeLinecap="round" />
          <g fill="#1c1b17">
            <rect x="37" y="45" width="7" height="42" />
            <rect x="37" y="80" width="26" height="7" />
            <rect x="73" y="45" width="7" height="42" />
            <rect x="73" y="45" width="24" height="7" />
            <rect x="73" y="62" width="19" height="7" />
          </g>
        </svg>

        <div
          style={{
            marginTop: 44,
            fontSize: 62,
            fontWeight: 700,
            letterSpacing: 18,
            color: "#1c1b17",
          }}
        >
          LYHOFF
        </div>

        <div
          style={{
            marginTop: 26,
            width: 132,
            height: 2,
            background: "#93906d",
          }}
        />

        <div style={{ marginTop: 26, fontSize: 30, color: "#57534d" }}>
          Real roots. Nothing to hide.
        </div>

        <div
          style={{
            marginTop: 54,
            fontSize: 19,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#7a7757",
          }}
        >
          Grown, made and tested by us
        </div>
      </div>
    ),
    size,
  );
}
