import ScrollReveal from "@/components/scroll-reveal";

type StoryChapterProps = {
  year: string;
  title: string;
  text: string;
  index: number;
  imageSrc?: string;
  imageAlt?: string;
};

export default function StoryChapter({
  year,
  title,
  text,
  index,
  imageSrc,
  imageAlt,
}: StoryChapterProps) {
  const imageFirst = index % 2 === 0;
  // Slightly different drift speed per chapter so the parallax doesn't
  // feel mechanically identical every time — values under 1 lag behind
  // scroll, creating the classic "floats up slower" parallax feel.
  const imageSpeed = 0.82 + (index % 3) * 0.06;
  const yearSpeed = 1.15 + (index % 2) * 0.08;

  const imageBlock = (
    <ScrollReveal x={imageFirst ? -70 : 70} y={0} className="relative">
      <div
        data-speed={imageSpeed}
        className="relative aspect-[4/3] w-full overflow-hidden border border-ink/15 bg-ink/5"
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={imageAlt ?? title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-ink/25 text-center">
            <span className="text-xs uppercase tracking-widest text-charcoal/40">
              Archival photo placeholder
            </span>
            <span className="text-[11px] text-charcoal/30">{year}</span>
          </div>
        )}
      </div>
    </ScrollReveal>
  );

  const textBlock = (
    <ScrollReveal
      x={imageFirst ? 70 : -70}
      y={0}
      delay={0.15}
      className="relative flex flex-col justify-center"
    >
      <p
        data-speed={yearSpeed}
        className="pointer-events-none select-none text-[6rem] font-bold leading-none text-ink/[0.06] sm:text-[8rem]"
        style={{ fontFamily: "var(--font-display)" }}
        aria-hidden="true"
      >
        {year}
      </p>
      <div className="-mt-8 sm:-mt-12">
        <p
          className="text-xs font-semibold uppercase tracking-[0.3em] text-brass"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {year}
        </p>
        <h3
          className="mt-2 text-2xl text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-charcoal/80">{text}</p>
      </div>
    </ScrollReveal>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-12">
      {imageFirst ? (
        <>
          {imageBlock}
          {textBlock}
        </>
      ) : (
        <>
          <div className="sm:order-2">{imageBlock}</div>
          <div className="sm:order-1">{textBlock}</div>
        </>
      )}
    </div>
  );
}