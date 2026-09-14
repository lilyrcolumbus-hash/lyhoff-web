"use client";

import { business } from "@/lib/settings";
import { day, money } from "./ui";
import { site } from "@/site.config";

interface Order {
  id: string;
  email: string;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  items: { name: string; quantity: number; amount_total: number }[];
  shipping_address: Record<string, string | null> | null;
  created_at: string;
}

/**
 * What goes in the box with the order.
 *
 * Hidden on screen and only visible to the printer — see the print rules in
 * app/admin/layout.tsx. It is deliberately plain: this is packing paperwork,
 * not marketing, and it has to be legible after a cheap inkjet and a fold.
 *
 * No prices marked "amount paid" beyond the line totals and a sum. A packing
 * slip is not a receipt or an invoice; Stripe already emails the customer one,
 * and printing a second document that looks like it would confuse anybody who
 * later needs the real one.
 */
export function PackingSlip({ order }: { order: Order }) {
  const address = order.shipping_address ?? {};
  const lines = [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ].filter((line): line is string => Boolean(line && line.trim()));

  return (
    <div className="packing-slip hidden print:block" aria-hidden>
      <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: "12pt" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <strong style={{ fontSize: "16pt", letterSpacing: "0.16em" }}>{site.name}</strong>
          <span style={{ fontSize: "10pt" }}>{day(order.created_at)}</span>
        </div>

        <hr style={{ margin: "10pt 0", border: 0, borderTop: "1pt solid #000" }} />

        <div style={{ display: "flex", gap: "24pt" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "9pt", letterSpacing: "0.12em", marginBottom: "4pt" }}>SHIP TO</p>
            {order.customer_name && <p style={{ fontWeight: 700 }}>{order.customer_name}</p>}
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p style={{ marginTop: "4pt", fontSize: "10pt" }}>{order.email}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "9pt", letterSpacing: "0.12em", marginBottom: "4pt" }}>ORDER</p>
            <p style={{ fontSize: "10pt", wordBreak: "break-all" }}>{order.id}</p>
          </div>
        </div>

        <table style={{ width: "100%", marginTop: "16pt", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontSize: "9pt", letterSpacing: "0.12em", borderBottom: "1pt solid #000", paddingBottom: "4pt" }}>
                ITEM
              </th>
              <th style={{ textAlign: "right", fontSize: "9pt", letterSpacing: "0.12em", borderBottom: "1pt solid #000", paddingBottom: "4pt", width: "12%" }}>
                QTY
              </th>
              <th style={{ textAlign: "right", fontSize: "9pt", letterSpacing: "0.12em", borderBottom: "1pt solid #000", paddingBottom: "4pt", width: "20%" }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item, index) => (
              <tr key={index}>
                <td style={{ padding: "6pt 0", borderBottom: "0.5pt solid #999" }}>{item.name}</td>
                <td style={{ padding: "6pt 0", borderBottom: "0.5pt solid #999", textAlign: "right" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "6pt 0", borderBottom: "0.5pt solid #999", textAlign: "right" }}>
                  {money(item.amount_total, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ textAlign: "right", marginTop: "8pt", fontWeight: 700 }}>
          {money(order.amount_total, order.currency)} · shipping included
        </p>

        <p style={{ marginTop: "28pt", fontSize: "10pt" }}>
          Thank you. Everything here was grown, made and packed by us.
        </p>
        <p style={{ marginTop: "4pt", fontSize: "9pt" }}>
          Questions about this order: {business.email}
        </p>
      </div>
    </div>
  );
}
