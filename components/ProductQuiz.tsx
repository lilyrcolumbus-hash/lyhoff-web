"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getQuizNode } from "@/lib/quiz";
import { getProduct } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { type Locale } from "@/lib/i18n";

export function ProductQuiz({
  locale,
  imageMap,
}: {
  locale: Locale;
  imageMap: Record<string, { url: string; isPlaceholder: boolean }>;
}) {
  const [nodeId, setNodeId] = useState("root");
  const [path, setPath] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const node = getQuizNode(nodeId);
  const product = result ? getProduct(result) : null;
  const image = result ? imageMap[result] : null;

  function choose(option: { next?: string; result?: string }) {
    if (option.result) {
      setResult(option.result);
      return;
    }
    if (option.next) {
      setPath((p) => [...p, nodeId]);
      setNodeId(option.next);
    }
  }

  function reset() {
    setNodeId("root");
    setPath([]);
    setResult(null);
  }

  function back() {
    const prev = path[path.length - 1];
    if (!prev) return;
    setPath((p) => p.slice(0, -1));
    setNodeId(prev);
  }

  return (
    <div className="mx-auto max-w-lg">
      <AnimatePresence mode="wait">
        {product && image ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-6 text-center text-sm font-medium text-stone-500">
              {locale === "en" ? "This one's for you:" : "Este es para ti:"}
            </p>
            <ProductCard
              product={product}
              locale={locale}
              imageUrl={image.url}
              isPlaceholderImage={image.isPlaceholder}
            />
            <button
              type="button"
              onClick={reset}
              className="mt-6 block w-full text-center text-sm font-medium text-forest-700 hover:underline"
            >
              {locale === "en" ? "Start over" : "Empezar de nuevo"}
            </button>
          </motion.div>
        ) : node ? (
          <motion.div
            key={nodeId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-center font-display text-2xl font-bold text-forest-950">
              {node.question[locale]}
            </h2>
            <div className="mt-8 flex flex-col gap-3">
              {node.options.map((option) => (
                <button
                  key={option.label.en}
                  type="button"
                  onClick={() => choose(option)}
                  className="w-full rounded-sm border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-forest-950 transition hover:border-indigo-400 hover:bg-forest-50"
                >
                  {option.label[locale]}
                </button>
              ))}
            </div>
            {path.length > 0 && (
              <button
                type="button"
                onClick={back}
                className="mt-6 block w-full text-center text-sm font-medium text-stone-400 hover:text-forest-700"
              >
                ← {locale === "en" ? "Back" : "Atrás"}
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
