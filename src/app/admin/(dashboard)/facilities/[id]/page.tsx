import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FacilityForm } from "@/components/admin/facility-form";

export const dynamic = "force-dynamic";

export default async function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
      is_published,
      display_order,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (!facility) {
    notFound();
  }

  const { data: images } = await supabase
    .from("facility_images")
    .select("*")
    .eq("facility_id", id)
    .order("display_order", { ascending: true });

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Link
          href="/admin/facilities"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/60 hover:text-ink mb-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Facilities
        </Link>
        <h1 className="text-3xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Edit Facility
        </h1>
      </div>

      <FacilityForm initialData={facility} initialImages={images || []} />
    </div>
  );
}