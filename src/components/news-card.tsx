import Link from "next/link";

type NewsCardProps = {
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  imageUrl?: string | null;
  location?: string | null;
  featured?: boolean;
};

export default function NewsCard({
  slug,
  title,
  imageUrl,
  featured = false,
}: NewsCardProps) {
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
            ? "aspect-[16/9] sm:aspect-auto sm:min-h-[220px] sm:flex-1"
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

      <div className={`flex flex-col gap-2 ${featured ? "p-5" : "p-3"}`}>
        <h4
          className={`leading-snug text-ink ${featured ? "text-xl" : "text-sm"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h4>

        <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition group-hover:text-brass">
          Read more &rarr;
        </span>
      </div>
    </Link>
  );
}