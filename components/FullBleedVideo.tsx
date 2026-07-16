/**
 * Edge-to-edge cinematic video banner — a bigger storytelling "beat" between
 * sections, unlike the smaller contained StockVideo used for process detail
 * shots. Same swappable-stock contract (badge + generic footage for now).
 */
export function FullBleedVideo({
  src,
  heading,
  sub,
  height = "h-[55vh] md:h-[70vh]",
}: {
  src: string;
  heading?: string;
  sub?: string;
  height?: string;
}) {
  return (
    <section className={`relative w-full overflow-hidden ${height}`}>
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-forest-950/15 to-forest-950/10" />
      {(heading || sub) && (
        <div className="relative flex h-full flex-col items-center justify-end px-6 pb-14 text-center sm:pb-16">
          {heading && (
            <h2 className="font-display max-w-2xl text-3xl font-bold text-cream sm:text-4xl md:text-5xl">
              {heading}
            </h2>
          )}
          {sub && (
            <p className="mt-4 max-w-lg text-sm text-cream/85 sm:text-base">{sub}</p>
          )}
        </div>
      )}
      <span className="absolute bottom-3 right-4 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm">
        Stock footage
      </span>
    </section>
  );
}
