import Link from "next/link";

type NewsCardProps = {
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  imageUrl?: string | null;
};

function excerpt(text: string, max = 140) {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

export default function NewsCard({ slug, title, body, createdAt, imageUrl }: NewsCardProps) {
  return (
    <Link
      href={`/news/${slug}`}
      className="group flex h-full flex-col overflow-hidden border border-ink/15 bg-paper transition hover:border-ink/30 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/5">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "repeating-linear-gradient(135deg, rgba(169,124,61,0.08) 0px, rgba(169,124,61,0.08) 2px, transparent 2px, transparent 22px), linear-gradient(160deg, var(--color-ink) 0%, #0a1220 100%)",
            }}
          >
            <span
              className="text-xs uppercase tracking-[0.3em] text-parchment/50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              FDSA
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brass">
          {new Date(createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h4
          className="mt-2 text-lg leading-snug text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h4>
        <p className="mt-2 flex-1 text-sm leading-6 text-charcoal/70">
          {excerpt(body)}
        </p>
        <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink transition group-hover:text-brass">
          Read more &rarr;
        </span>
      </div>
    </Link>
  );
}