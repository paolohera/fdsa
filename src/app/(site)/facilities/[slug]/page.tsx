import Link from "next/link";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/scroll-reveal";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/server-static";
import { GalleryViewer } from "@/components/facility-gallery-viewer";

export async function generateStaticParams() {
  const supabase = await createStaticClient();
  const { data: facilities } = await supabase
    .from("facilities")
    .select("slug")
    .eq("is_published", true);
  return (facilities ?? []).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: facility } = await supabase
    .from("facilities")
    .select("title, short_description")
    .eq("slug", slug)
    .single();
  if (!facility) return {};
  return {
    title: `${facility.title} | FDSA Facilities`,
    description: facility.short_description || `Explore ${facility.title} at FDSA's Mactan-Cebu campus`,
  };
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: facility } = await supabase
    .from("facilities")
    .select(`
      id,
      title,
      slug,
      short_description,
      full_description,
      cover_image,
      facility_images (
        id,
        image_url,
        alt_text,
        is_cover,
        display_order
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!facility) {
    notFound();
  }

  const galleryOnlyImages = (facility.facility_images ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      id: img.id,
      image_url: img.image_url,
      alt_text: img.alt_text,
    }));

  const coverImage = facility.cover_image || galleryOnlyImages[0]?.image_url;

  // One unified image list: cover first, then the rest, no duplicates.
  const allImages = coverImage
    ? [
        {
          id: `cover-${facility.id}`,
          image_url: coverImage,
          alt_text: facility.title,
        },
        ...galleryOnlyImages.filter((img) => img.image_url !== coverImage),
      ]
    : galleryOnlyImages;

  // Intro (hero) uses the short blurb; if there isn't one, fall back to
  // full_description — but then the About section below should NOT repeat it.
  const introText = facility.short_description || facility.full_description;
  const aboutText = facility.full_description;
  const showAboutSection = Boolean(aboutText) && aboutText !== introText;

  return (
    <div>
      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto max-w-3xl px-6 pt-28 pb-12 sm:pt-32 lg:pt-40">
          <Link
            href="/facilities"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brass transition hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All Facilities
          </Link>

          <ScrollReveal>
            <p
              className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-brass"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Campus
            </p>
            <h1
              className="mt-2 text-4xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {facility.title}
            </h1>
            {introText && (
              <p className="mt-4 text-sm leading-7 text-charcoal/80">
                {introText}
              </p>
            )}
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <ScrollReveal>
          <GalleryViewer images={allImages} facilityTitle={facility.title} />
        </ScrollReveal>

        {showAboutSection && (
          <ScrollReveal delay={0.1} className="mt-10">
            <div className="flex items-center justify-between border-b border-ink/20 pb-3">
              <h2
                className="text-xl text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                About This Facility
              </h2>
            </div>
            <div className="mt-6 prose prose-ink max-w-none">
              <p className="leading-7 text-charcoal/80">{aboutText}</p>
            </div>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}