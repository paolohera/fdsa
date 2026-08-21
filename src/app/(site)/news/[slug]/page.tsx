import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

const SITE_URL = "https://www.fdsa.site";

function excerpt(text: string, max: number) {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("news_posts")
    .select("title, body, created_at, image_url")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) {
    return { title: "News" };
  }

  const description = excerpt(post.body, 160);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.created_at,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.image_url ? [post.image_url] : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("news_posts")
    .select("title, body, created_at, image_url, location")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  // NewsArticle structured data — helps Google associate this page with
  // your organization and can surface it in Top Stories / rich results.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    datePublished: post.created_at,
    dateModified: post.created_at,
    image: post.image_url ? [post.image_url] : undefined,
    description: excerpt(post.body, 160),
    mainEntityOfPage: `${SITE_URL}/news/${slug}`,
    publisher: {
      "@type": "EducationalOrganization",
      name: "Flight Dynamics School of Aeronautics, Inc.",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/fdsa-logo.png`,
      },
    },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {post.image_url ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-ink/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        // No image — the fixed header floats over the (21/9) image above in
        // the other branch, but with no image there's nothing for it to
        // float over, so this spacer clears the header instead. Heights
        // match the pt-* header-clearance values used on About/Programs/
        // Facilities/News list (h-28/32/40 = pt-28/32/40 in px).
        <div className="h-28 sm:h-32 lg:h-40" aria-hidden="true" />
      )}

      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/news" className="text-sm text-brass hover:underline">
          &larr; Back to news
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-wide text-brass">
          <span>
            {new Date(post.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {post.location && (
            <span className="inline-flex items-center gap-1 normal-case tracking-normal text-charcoal/60">
              <MapPin size={13} className="shrink-0" />
              {post.location}
            </span>
          )}
        </div>

        <h1
          className="mt-2 text-4xl leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h1>

        <div className="mt-8 whitespace-pre-wrap text-base leading-7 text-charcoal">
          {post.body}
        </div>
      </div>
    </article>
  );
}