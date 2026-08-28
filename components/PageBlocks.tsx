import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProduct } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import type { Block } from "@/lib/pages";
import type { Locale } from "@/lib/i18n";

/**
 * Renders a composed page.
 *
 * Every block is a known shape with known markup, so a page assembled in the
 * panel inherits the site's type and spacing rather than inventing its own —
 * and no arrangement of blocks can produce something that fails to build.
 *
 * Unknown block types are skipped rather than throwing: a page saved by a newer
 * panel than the deployed site should lose one section, not the whole page.
 */
export function PageBlocks({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  return (
    <div className="mt-10 flex flex-col gap-10">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={index} className="font-display text-2xl font-bold text-forest-950">
                {block.text[locale]}
              </h2>
            );

          case "text":
            return (
              <div key={index} className="flex flex-col gap-4">
                {block.text[locale]
                  .split("\n")
                  .filter((paragraph) => paragraph.trim())
                  .map((paragraph, i) => (
                    <p key={i} className="text-[15px] leading-relaxed text-stone-700">
                      {paragraph}
                    </p>
                  ))}
              </div>
            );

          case "image":
            return (
              <Image
                key={index}
                src={block.src}
                alt={block.alt[locale]}
                width={1200}
                height={800}
                className="w-full bg-stone-50 object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            );

          case "video":
            return (
              <figure key={index} className="flex flex-col gap-3">
                <video
                  src={block.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full bg-stone-100 object-cover"
                />
                {block.heading[locale] && (
                  <figcaption className="text-[13px] text-stone-500">{block.heading[locale]}</figcaption>
                )}
              </figure>
            );

          case "products": {
            // A slug that no longer exists is dropped rather than rendering a
            // hole — products get hidden, and a page should survive that.
            const found = block.slugs.map((slug) => getProduct(slug)).filter((p) => p !== undefined);
            if (found.length === 0) return null;
            return (
              <section key={index} className="flex flex-col gap-5">
                {block.heading[locale] && (
                  <h2 className="font-display text-2xl font-bold text-forest-950">
                    {block.heading[locale]}
                  </h2>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  {found.map((product, i) => {
                    const image = getProductImageUrl(product.slug, product.image);
                    return (
                      <ProductCard
                        key={product.slug}
                        product={product}
                        locale={locale}
                        imageUrl={image.url}
                        isPlaceholderImage={image.isPlaceholder}
                        index={i}
                      />
                    );
                  })}
                </div>
              </section>
            );
          }

          case "faq":
            return (
              <section key={index} className="flex flex-col divide-y divide-stone-200 border-y border-stone-200">
                {block.items.map((item, i) => (
                  <details key={i} className="group py-4">
                    <summary className="cursor-pointer list-none font-display text-[15px] font-semibold text-forest-950">
                      {item.q[locale]}
                    </summary>
                    <p className="mt-2 text-[14px] leading-relaxed text-stone-700">{item.a[locale]}</p>
                  </details>
                ))}
              </section>
            );

          case "button":
            return (
              <Link
                key={index}
                href={block.path.startsWith("http") ? block.path : `/${locale}/${block.path.replace(/^\/|\/$/g, "")}/`}
                className="self-start rounded-sm bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800"
              >
                {block.label[locale]}
              </Link>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
