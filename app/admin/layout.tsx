import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, Inter } from "next/font/google";
import "../globals.css";

// The admin sits outside app/[lang]/ — it is one internal tool, not a
// customer-facing page, so it is never translated and never carries the store
// chrome. That also means it needs its own root html/body, the same way
// app/not-found.tsx does.
const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LYHOFF Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${zenKaku.variable} ${inter.variable} h-full`}>
      <head>
        {/*
          Printing a packing slip means printing one element and nothing else.
          Hiding the rest with `visibility` rather than `display` keeps the slip
          in its normal place in the document, which is what stops the browser
          from paginating around a collapsed layout.
        */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .packing-slip, .packing-slip * { visibility: visible; }
            .packing-slip {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              color: #000;
            }
            @page { margin: 16mm; }
          }
        `}</style>
      </head>
      <body className="min-h-full bg-stone-100 text-ink">{children}</body>
    </html>
  );
}
