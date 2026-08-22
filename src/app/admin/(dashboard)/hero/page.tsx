import { createClient } from "@/lib/supabase/server";
import { updateHeroImage } from "./actions";
import { AdminPageHeader, AdminCard, AdminButton } from "@/components/admin/admin-ui";

export default async function HeroImagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: hero } = await supabase
    .from("hero_image")
    .select("image_url")
    .maybeSingle();

  return (
    <div>
      <AdminPageHeader
        title="Homepage hero image"
        description="The full-width banner image shown at the top of the homepage."
      />

      {error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminCard className="max-w-2xl p-6">
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-ink/5">
          {hero?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero.image_url}
              alt="Homepage hero"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <span className="text-xs uppercase tracking-widest text-charcoal/40">
                No hero image set
              </span>
              <span className="text-[11px] text-charcoal/30">
                Falls back to /hero-background.png on the live site
              </span>
            </div>
          )}
        </div>

        <form action={updateHeroImage} className="mt-5 flex items-center gap-2">
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="flex-1 text-sm text-charcoal/60 file:mr-3 file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-ink/10"
          />
          <AdminButton type="submit">
            {hero?.image_url ? "Replace" : "Upload"}
          </AdminButton>
        </form>
        <p className="mt-2 text-xs text-charcoal/40">
          Recommend a wide landscape photo, at least 1920px wide.
        </p>
      </AdminCard>
    </div>
  );
}