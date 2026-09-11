/**
 * MCP server for the LYHOFF store.
 *
 * Exposes the shop's own data — catalogue, orders, customers, reviews — to an
 * MCP client (claude.ai connectors) over the Streamable HTTP transport, mounted
 * on the Worker that already serves the site. No second service, no second
 * deploy, and the data never leaves the same trust boundary the admin panel
 * already lives in.
 *
 * READ ONLY, deliberately. Every tool here answers a question; none of them
 * change anything. Editing a price or refunding an order stays in /admin, where
 * a mistake is visible and reversible on screen — a chat client that can spend
 * money on the owner's behalf is a different risk class, and this connector is
 * not the place to open it.
 *
 * Authorisation is a single shared secret (MCP_TOKEN), accepted either as the
 * last path segment (/api/mcp/<token>) or as a bearer header, because a client
 * that only lets you paste a URL still has to be able to authenticate. Anyone
 * holding that token reads real customer names, emails and addresses, so it is
 * revoked by replacing the secret:
 *
 *   npx wrangler secret put MCP_TOKEN
 *
 * An MCP client has no Supabase session of its own to forward, unlike the admin
 * panel. The obvious shortcut — hand this Worker a service_role key — was
 * rejected: that key bypasses row level security for writes as well, which is an
 * enormous grant for a feature that only answers questions. Instead the Worker
 * keeps only the public anon key and calls the purpose-built read functions in
 * supabase/mcp-read.sql, each gated on MCP_DB_TOKEN. Postgres decides, exactly
 * as it does everywhere else here.
 */

interface McpEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  /** Proves to Postgres that a read came from this Worker. */
  MCP_DB_TOKEN?: string;
  MCP_TOKEN?: string;
}

/**
 * The same public anon key worker.ts already defaults to — it ships inside the
 * site's own JavaScript, so it is not a secret. It is only ever a ticket to
 * reach PostgREST; what may actually be read is decided in Postgres.
 */
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneHRpbHdqaGZob2hyaGNqZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODYzODgsImV4cCI6MjEwMDc2MjM4OH0.Q9SATTl0QmaAX0NrpxntyD3rWSu8tZ258b492v0Sp9w";

/** The transport version this server speaks. */
const PROTOCOL_VERSION = "2025-06-18";
const SERVER_NAME = "lyhoff-store";
const SERVER_VERSION = "1.0.0";

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

type ToolHandler = (args: Record<string, unknown>, db: Db) => Promise<string>;

interface Tool {
  name: string;
  title: string;
  description: string;
  schema: Record<string, unknown>;
  run: ToolHandler;
}

// --- Supabase ---------------------------------------------------------------

interface Db {
  url: string;
  /** Public anon key — the only Supabase key this Worker holds. */
  key: string;
  /** Shared secret the mcp_* functions check before returning any row. */
  token: string;
}

/**
 * A public read. Products carry no private data and the storefront is built
 * from the same table, so anon's own read policy covers this one.
 */
async function select<T>(db: Db, path: string): Promise<T[]> {
  const res = await fetch(`${db.url}/rest/v1/${path}`, {
    headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("mcp read failed", path, res.status, detail);
    throw new Error(`Could not read ${path.split("?")[0]} (${res.status}).`);
  }

  return (await res.json()) as T[];
}

/**
 * A private read, through the SECURITY DEFINER functions in
 * supabase/mcp-read.sql. A wrong token comes back as an empty set rather than an
 * error — deliberate, so a caller probing this learns nothing — which is why an
 * empty result is reported as a configuration problem rather than as "no rows".
 */
async function readPrivate<T>(db: Db, fn: string): Promise<T[]> {
  const res = await fetch(`${db.url}/rest/v1/rpc/mcp_${fn}`, {
    method: "POST",
    headers: {
      apikey: db.key,
      Authorization: `Bearer ${db.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: db.token }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("mcp private read failed", fn, res.status, detail);
    throw new Error(`Could not read ${fn} (${res.status}). Has supabase/mcp-read.sql been run?`);
  }

  return (await res.json()) as T[];
}

// --- Shapes -----------------------------------------------------------------

/** A bilingual field as stored: { en, es }. */
type Bilingual = { en?: string; es?: string } | null

interface ProductRow {
  slug: string
  category: string
  name: Bilingual
  tagline: Bilingual
  description: Bilingual
  ingredients: Bilingual[]
  benefits: Bilingual[]
  how_to_use: Bilingual
  gift: Bilingual
  badge: Bilingual
  price: number
  size: string
  active: boolean
  stock: number | null
  variant_group: string | null
  scent: string | null
  photos: string[]
  reviews: { text?: Bilingual; author?: string; location?: string }[]
}

interface OrderItem {
  name?: string
  quantity?: number
  amount_total?: number
}

interface OrderRow {
  id: string
  email: string
  customer_name: string | null
  amount_total: number
  currency: string
  items: OrderItem[]
  shipping_address: Record<string, unknown> | null
  tracking_number: string | null
  tracking_url: string | null
  shipped_at: string | null
  refunded_total: number
  created_at: string
}

interface ReviewRow {
  id: string
  slug: string | null
  rating: number
  author: string
  location: string | null
  text: string
  translation: string | null
  locale: string | null
  approved: boolean
  created_at: string
}

interface AbandonedRow {
  id: string
  email: string
  customer_name: string | null
  amount_total: number
  items: OrderItem[]
  recovered_at: string | null
  emailed_at: string | null
  created_at: string
}

interface SubscriberRow {
  email: string
  locale: string | null
  source: string | null
  unsubscribed_at: string | null
  created_at: string
}

// --- Formatting -------------------------------------------------------------

const en = (value: Bilingual): string => value?.en ?? value?.es ?? "";
const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
const day = (iso: string | null): string => (iso ? iso.slice(0, 10) : "—");

function describeItems(items: OrderItem[]): string {
  if (!Array.isArray(items) || items.length === 0) return "—"
  return items.map((item) => `${item.quantity ?? 1}x ${item.name ?? "?"}`).join(", ");
}

function describeAddress(address: Record<string, unknown> | null): string {
  if (!address) return "no address on file"
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ]
  return parts.filter((part) => typeof part === "string" && part.length > 0).join(", ");
}

/** An order is waiting to be packed until a tracking number exists. */
const isUnshipped = (order: OrderRow): boolean => !order.tracking_number

// --- Tools ------------------------------------------------------------------

const TOOLS: Tool[] = [
  {
    name: "list_products",
    title: "List products",
    description:
      "The catalogue as the admin panel sees it right now, including edits that have not been published to the live site yet. Shows price, stock, visibility and which variant group each item belongs to.",
    schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Match against product name, slug or scent." },
        category: { type: "string", description: "bodycare, hair, home or hoff." },
        include_hidden: {
          type: "boolean",
          description: "Include products that are hidden from the shop. Default true.",
        },
      },
    },
    async run(args, db) {
      const rows = await select<ProductRow>(db, "products?select=*&order=position.asc,slug.asc&limit=500");
      const query = typeof args.query === "string" ? args.query.toLowerCase() : "";
      const category = typeof args.category === "string" ? args.category : "";
      const includeHidden = args.include_hidden !== false

      const matches = rows.filter((row) => {
        if (!includeHidden && !row.active) return false
        if (category && row.category !== category) return false
        if (!query) return true
        const haystack = `${row.slug} ${en(row.name)} ${row.scent ?? ""}`.toLowerCase();
        return haystack.includes(query);
      })

      if (matches.length === 0) return "No products match that."

      const lines = matches.map((row) => {
        const stock = row.stock === null ? "untracked" : `${row.stock} in stock`;
        const visible = row.active ? "visible" : "HIDDEN";
        return `${row.slug} — ${en(row.name)} · $${Number(row.price).toFixed(2)} · ${row.size} · ${stock} · ${visible}`;
      })

      return `${matches.length} of ${rows.length} products:\n\n${lines.join("\n")}`;
    },
  },

  {
    name: "get_product",
    title: "Get one product",
    description:
      "Everything stored about one product: both languages, ingredients, benefits, how to use, photos and its sibling variants.",
    schema: {
      type: "object",
      properties: { slug: { type: "string", description: "The product's slug, e.g. tallow-cream-2oz." } },
      required: ["slug"],
    },
    async run(args, db) {
      const slug = String(args.slug ?? "");
      if (!slug) throw new Error("A slug is required.")

      const rows = await select<ProductRow>(db, `products?select=*&slug=eq.${encodeURIComponent(slug)}`);
      const product = rows[0];
      if (!product) throw new Error(`No product with slug "${slug}".`)

      const siblings = product.variant_group
        ? await select<ProductRow>(
            db,
            `products?select=slug,size,scent,price,stock,active&variant_group=eq.${encodeURIComponent(product.variant_group)}`,
          )
        : []

      const ingredients = product.ingredients.map(en).filter(Boolean).join(", ") || "—";
      const benefits = product.benefits.map(en).filter(Boolean).map((b) => `  - ${b}`).join("\n") || "  —";
      const variants =
        siblings.length > 1
          ? siblings
              .map(
                (s) =>
                  `  - ${s.slug} · ${s.size}${s.scent ? ` · ${s.scent}` : ""} · $${Number(s.price).toFixed(2)}${s.active ? "" : " (hidden)"}`,
              )
              .join("\n")
          : "  none — this product stands alone"

      return [
        `${en(product.name)} (${product.slug})`,
        `Category: ${product.category} · Size: ${product.size} · $${Number(product.price).toFixed(2)}`,
        `Stock: ${product.stock === null ? "untracked, always sells" : product.stock}`,
        `Visible in shop: ${product.active ? "yes" : "no"}`,
        product.gift ? `Free gift: ${en(product.gift)}` : "",
        "",
        `Tagline (EN): ${en(product.tagline)}`,
        `Tagline (ES): ${product.tagline?.es ?? "—"}`,
        "",
        `Description (EN): ${en(product.description)}`,
        "",
        `Ingredients: ${ingredients}`,
        "",
        "Benefits:",
        benefits,
        "",
        `How to use: ${en(product.how_to_use)}`,
        "",
        `Photos: ${Array.isArray(product.photos) ? product.photos.length : 0}`,
        `Published reviews on the product page: ${Array.isArray(product.reviews) ? product.reviews.length : 0}`,
        "",
        "Variants in the same product:",
        variants,
      ]
        .filter((line) => line !== "")
        .join("\n")
    },
  },

  {
    name: "list_orders",
    title: "List orders",
    description:
      "Real orders, newest first. Use status 'to_ship' for what still needs packing — that is anything without a tracking number.",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["to_ship", "shipped", "all"],
          description: "Default all.",
        },
        days: { type: "number", description: "Only orders from the last N days." },
        limit: { type: "number", description: "Default 25, maximum 200." },
      },
    },
    async run(args, db) {
      const limit = Math.min(Math.max(Number(args.limit) || 25, 1), 200);
      const status = typeof args.status === "string" ? args.status : "all";

      const since =
        typeof args.days === "number" && args.days > 0
          ? new Date(Date.now() - args.days * 86400000).toISOString()
          : "";

      const all = await readPrivate<OrderRow>(db, "orders");
      const rows = since ? all.filter((row) => row.created_at >= since) : all;
      const matches = rows
        .filter((row) => {
          if (status === "to_ship") return isUnshipped(row)
          if (status === "shipped") return !isUnshipped(row)
          return true
        })
        .slice(0, limit)

      if (matches.length === 0) return "No orders match that."

      const lines = matches.map((row) => {
        const who = row.customer_name || row.email
        const state = isUnshipped(row) ? "TO SHIP" : `shipped ${day(row.shipped_at)}`;
        const refund = row.refunded_total > 0 ? ` · refunded ${money(row.refunded_total)}` : "";
        return `${day(row.created_at)} · ${money(row.amount_total)} · ${who} · ${state}${refund}\n    ${describeItems(row.items)}\n    ${row.id}`;
      })

      const waiting = rows.filter(isUnshipped).length
      return `${matches.length} orders shown. ${waiting} still waiting to be packed.\n\n${lines.join("\n\n")}`;
    },
  },

  {
    name: "get_order",
    title: "Get one order",
    description: "One order in full: what was bought, where it ships, tracking and any refund.",
    schema: {
      type: "object",
      properties: { id: { type: "string", description: "The Stripe session id (cs_...)." } },
      required: ["id"],
    },
    async run(args, db) {
      const id = String(args.id ?? "");
      if (!id) throw new Error("An order id is required.")

      const rows = await readPrivate<OrderRow>(db, "orders");
      const order = rows.find((row) => row.id === id);
      if (!order) throw new Error(`No order with id "${id}".`)

      const items = (order.items ?? [])
        .map((item) => `  - ${item.quantity ?? 1}x ${item.name ?? "?"}${item.amount_total ? ` — ${money(item.amount_total)}` : ""}`)
        .join("\n")

      return [
        `Order ${order.id}`,
        `Placed: ${day(order.created_at)}`,
        `Customer: ${order.customer_name ?? "—"} <${order.email}>`,
        `Total: ${money(order.amount_total)} ${order.currency.toUpperCase()}`,
        order.refunded_total > 0 ? `Refunded: ${money(order.refunded_total)}` : "",
        "",
        "Items:",
        items || "  —",
        "",
        `Ship to: ${describeAddress(order.shipping_address)}`,
        order.tracking_number
          ? `Tracking: ${order.tracking_number}${order.tracking_url ? ` (${order.tracking_url})` : ""} — shipped ${day(order.shipped_at)}`
          : "Tracking: none yet, this order still needs packing",
      ]
        .filter((line) => line !== "")
        .join("\n")
    },
  },

  {
    name: "find_customer",
    title: "Find a customer",
    description:
      "Everything known about one person, assembled from their orders and the mailing list — there is no customers table, the orders are the record.",
    schema: {
      type: "object",
      properties: { email: { type: "string", description: "Full or partial email address, or a name." } },
      required: ["email"],
    },
    async run(args, db) {
      const needle = String(args.email ?? "").toLowerCase();
      if (!needle) throw new Error("An email or name is required.")

      const orders = await readPrivate<OrderRow>(db, "orders");
      const theirs = orders.filter(
        (row) =>
          row.email.toLowerCase().includes(needle) ||
          (row.customer_name ?? "").toLowerCase().includes(needle),
      )

      const subscribers = (await readPrivate<SubscriberRow>(db, "subscribers"))
        .filter((row) => row.email.toLowerCase().includes(needle))
        .slice(0, 20);

      if (theirs.length === 0 && subscribers.length === 0) {
        return `Nobody matching "${needle}" has ordered or joined the list.`;
      }

      const spent = theirs.reduce((sum, row) => sum + row.amount_total - row.refunded_total, 0);
      const latest = theirs[0];

      const history = theirs
        .map((row) => `  - ${day(row.created_at)} · ${money(row.amount_total)} · ${describeItems(row.items)}`)
        .join("\n")

      const onList = subscribers
        .map(
          (row) =>
            `  - ${row.email} · joined ${day(row.created_at)} via ${row.source ?? "?"}${row.unsubscribed_at ? " · UNSUBSCRIBED" : ""}`,
        )
        .join("\n")

      return [
        theirs.length > 0 ? `${latest.customer_name ?? latest.email}` : `Matching "${needle}"`,
        theirs.length > 0
          ? `${theirs.length} order${theirs.length === 1 ? "" : "s"} · ${money(spent)} spent net of refunds`
          : "No orders.",
        theirs.length > 0 ? `Last address: ${describeAddress(latest.shipping_address)}` : "",
        "",
        theirs.length > 0 ? "Order history:" : "",
        theirs.length > 0 ? history : "",
        "",
        subscribers.length > 0 ? "On the mailing list:" : "Not on the mailing list.",
        subscribers.length > 0 ? onList : "",
      ]
        .filter((line) => line !== "")
        .join("\n")
    },
  },

  {
    name: "list_reviews",
    title: "List reviews",
    description:
      "Customer reviews submitted through the thank-you card flow. Pending ones are not on the site until they are approved in /admin and the site is published.",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["pending", "approved", "all"], description: "Default pending." },
        slug: { type: "string", description: "Only reviews for this product." },
      },
    },
    async run(args, db) {
      const status = typeof args.status === "string" ? args.status : "pending";
      const slug = typeof args.slug === "string" ? args.slug : "";

      const rows = (await readPrivate<ReviewRow>(db, "reviews")).filter((row) => {
        if (status === "pending" && row.approved) return false;
        if (status === "approved" && !row.approved) return false;
        if (slug && row.slug !== slug) return false;
        return true;
      });
      if (rows.length === 0) return "No reviews match that."

      const lines = rows.map((row) => {
        const stars = "★".repeat(row.rating) + "☆".repeat(5 - row.rating);
        const state = row.approved ? "approved" : "PENDING";
        const translated = row.translation ? " · translated" : " · not translated";
        return `${stars} ${row.author}${row.location ? `, ${row.location}` : ""} · ${row.slug ?? "general"} · ${day(row.created_at)} · ${state}${translated}\n    "${row.text}"`;
      })

      return `${rows.length} reviews:\n\n${lines.join("\n\n")}`;
    },
  },

  {
    name: "list_abandoned_checkouts",
    title: "List abandoned checkouts",
    description:
      "Checkouts that expired without payment. Each one was sent a single reminder carrying Stripe's own recovery link; recovered means they came back and paid.",
    schema: {
      type: "object",
      properties: { limit: { type: "number", description: "Default 25." } },
    },
    async run(args, db) {
      const limit = Math.min(Math.max(Number(args.limit) || 25, 1), 100);
      const rows = (await readPrivate<AbandonedRow>(db, "abandoned")).slice(0, limit);
      if (rows.length === 0) return "No abandoned checkouts recorded."

      const recovered = rows.filter((row) => row.recovered_at).length
      const lines = rows.map((row) => {
        const state = row.recovered_at ? `RECOVERED ${day(row.recovered_at)}` : "not recovered";
        return `${day(row.created_at)} · ${money(row.amount_total)} · ${row.customer_name ?? row.email} · ${state}\n    ${describeItems(row.items)}`;
      })

      return `${rows.length} abandoned checkouts, ${recovered} recovered.\n\n${lines.join("\n\n")}`;
    },
  },

  {
    name: "store_summary",
    title: "Store summary",
    description:
      "How the shop is doing: revenue, orders waiting to be packed, best sellers, stock about to run out, list size and pending reviews.",
    schema: {
      type: "object",
      properties: { days: { type: "number", description: "Window for revenue and best sellers. Default 30." } },
    },
    async run(args, db) {
      const days = Math.min(Math.max(Number(args.days) || 30, 1), 365);
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const [orders, products, reviews, subscribers, abandoned] = await Promise.all([
        readPrivate<OrderRow>(db, "orders"),
        select<ProductRow>(db, "products?select=slug,name,stock,active,price&limit=500"),
        readPrivate<ReviewRow>(db, "reviews"),
        readPrivate<SubscriberRow>(db, "subscribers"),
        readPrivate<AbandonedRow>(db, "abandoned"),
      ])

      const recent = orders.filter((row) => row.created_at >= since);
      const revenue = recent.reduce((sum, row) => sum + row.amount_total - row.refunded_total, 0);
      const waiting = orders.filter(isUnshipped);

      const sold = new Map<string, number>();
      for (const order of recent) {
        for (const item of order.items ?? []) {
          const name = item.name ?? "?";
          sold.set(name, (sold.get(name) ?? 0) + (item.quantity ?? 1))
        }
      }
      const best = [...sold.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `  - ${count}x ${name}`)
        .join("\n")

      const low = products
        .filter((row) => row.active && typeof row.stock === "number" && row.stock <= 3)
        .map((row) => `  - ${en(row.name)} (${row.slug}): ${row.stock} left`)
        .join("\n")

      const pending = reviews.filter((row) => !row.approved).length
      const active = subscribers.filter((row) => !row.unsubscribed_at).length
      const recovered = abandoned.filter((row) => row.recovered_at).length

      return [
        `Last ${days} days`,
        `  Revenue (net of refunds): ${money(revenue)}`,
        `  Orders: ${recent.length}`,
        `  Average order: ${recent.length > 0 ? money(Math.round(revenue / recent.length)) : "—"}`,
        "",
        `Waiting to be packed: ${waiting.length}`,
        waiting.length > 0
          ? waiting.slice(0, 5).map((row) => `  - ${day(row.created_at)} · ${row.customer_name ?? row.email}`).join("\n")
          : "  nothing outstanding",
        "",
        "Best sellers in the window:",
        best || "  no sales in this window",
        "",
        "Stock running out (3 or fewer, visible products only):",
        low || "  nothing low",
        "",
        `Reviews waiting for approval: ${pending}`,
        `Mailing list: ${active} active`,
        `Abandoned checkouts: ${abandoned.length}, ${recovered} recovered`,
        `Catalogue: ${products.filter((row) => row.active).length} visible of ${products.length}`,
      ].join("\n")
    },
  },
]

// --- JSON-RPC ---------------------------------------------------------------

const rpcResult = (id: JsonRpcRequest["id"], result: unknown): Response =>
  new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { "Content-Type": "application/json" },
  })

const rpcError = (id: JsonRpcRequest["id"], code: number, message: string): Response =>
  new Response(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }), {
    headers: { "Content-Type": "application/json" },
  })

/** Constant-time-ish compare, so a wrong token leaks nothing through timing. */
function tokenMatches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false
  let diff = 0
  for (let index = 0; index < given.length; index += 1) {
    diff |= given.charCodeAt(index) ^ expected.charCodeAt(index)
  }
  return diff === 0
}

function presentedToken(request: Request, pathToken: string): string {
  if (pathToken) return pathToken
  const header = request.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

/**
 * @param pathToken the segment after /api/mcp/, empty when the client sends a
 *                  bearer header instead.
 */
export async function handleMcp(request: Request, env: McpEnv, pathToken: string): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
      },
    })
  }

  // The spec lets a server decline the server-initiated stream; this one has
  // nothing to push, so every exchange is a plain request/response.
  if (request.method === "GET" || request.method === "DELETE") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!env.MCP_TOKEN) {
    return rpcError(null, -32603, "This server has no MCP_TOKEN set, so it refuses every request.");
  }
  if (!tokenMatches(presentedToken(request, pathToken), env.MCP_TOKEN)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" },
    })
  }

  let body: JsonRpcRequest
  try {
    body = (await request.json()) as JsonRpcRequest
  } catch {
    return rpcError(null, -32700, "That was not valid JSON.");
  }

  const { id = null, method = "" } = body

  // Notifications carry no id and expect no body back.
  if (method.startsWith("notifications/")) return new Response(null, { status: 202 })

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: SERVER_NAME, title: "LYHOFF store", version: SERVER_VERSION },
      instructions:
        "Read-only access to the LYHOFF shop: catalogue, orders, customers, reviews and abandoned checkouts. Prices are in US dollars and order totals in cents. Nothing here can change the store — edits and refunds happen in the admin panel at lyhoff.com/admin.",
    })
  }

  if (method === "ping") return rpcResult(id, {})

  if (method === "tools/list") {
    return rpcResult(id, {
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.schema,
      })),
    })
  }

  if (method === "tools/call") {
    const params = body.params ?? {}
    const name = typeof params.name === "string" ? params.name : "";
    const args = (params.arguments as Record<string, unknown> | undefined) ?? {}
    const tool = TOOLS.find((candidate) => candidate.name === name);
    if (!tool) return rpcError(id, -32602, `There is no tool called "${name}".`)

    const url = env.SUPABASE_URL || "https://egxtilwjhfhohrhcjgbe.supabase.co";
    const key = env.SUPABASE_ANON_KEY || ANON_KEY;
    const token = env.MCP_DB_TOKEN ?? "";
    if (!token) {
      return rpcResult(id, {
        content: [
          { type: "text", text: "MCP_DB_TOKEN is not set on this Worker, so Postgres will hand back nothing." },
        ],
        isError: true,
      });
    }

    try {
      const text = await tool.run(args, { url, key, token });
      return rpcResult(id, { content: [{ type: "text", text }] });
    } catch (error) {
      // A tool failing is an answer, not a transport fault — the model should
      // see what went wrong and be able to try something else.
      const message = error instanceof Error ? error.message : "Unknown error.";
      return rpcResult(id, { content: [{ type: "text", text: message }], isError: true });
    }
  }

  return rpcError(id, -32601, `Unknown method "${method}".`);
}
