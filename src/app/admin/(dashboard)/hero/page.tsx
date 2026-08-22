import { createClient } from "@/lib/supabase/server";
import { updateHeroImage } from "./actions";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";
import HeroImageForm from "./hero-image-form";

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
        <HeroImageForm action={updateHeroImage} currentImageUrl={hero?.image_url} />
      </AdminCard>
    </div>
  );
}