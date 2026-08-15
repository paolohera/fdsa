import Link from "next/link";
import { MapPin } from "lucide-react";

type NewsCardProps = {
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  imageUrl?: string | null;
  location?: string | null;
  featured?: boolean;
};

function excerpt(text: string, max: number) {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

export default function NewsCard({
  slug,
  title,
  body,
  createdAt,
  imageUrl,
  location,
  featured = false,
}: NewsCardProps) {
  const dateStr = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/news/${slug}`}
      className={`group flex flex-col overflow-hidden border border-ink/15 bg-paper transition hover:border-ink/30 hover:shadow-md ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-ink/5 ${
          featured
            ? "aspect-[16/9] sm:aspect-auto sm:min-h-[160px] sm:flex-1"
            : "aspect-[16/10]"
        }`}
      >
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

      <div className={`flex flex-col gap-1.5 ${featured ? "p-5" : "p-3"}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-wide text-brass">
          <span>{dateStr}</span>
          {location && (
            <span className="inline-flex items-center gap-1 font-normal normal-case tracking-normal text-charcoal/55">
              <MapPin size={11} className="shrink-0" />
              {location}
            </span>
          )}
        </div>

        <h4
          className={`leading-snug text-ink ${featured ? "text-xl" : "text-sm"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h4>

        {featured && (
          <>
            <p className="mt-1 text-sm leading-6 text-charcoal/70">
              {excerpt(body, 200)}
            </p>
            <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink transition group-hover:text-brass">
              Read more &rarr;
            </span>
          </>
        )}
      </div>
    </Link>
  );
}