import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminCard, AdminBadge, AdminEmptyState } from "@/components/admin/admin-ui";
import { DeleteFacilityButton } from "@/components/admin/delete-facility-button";
import {
  Plus,
  Image as ImageIcon,
  GalleryHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FacilitiesListPage() {
  const supabase = await createClient();

  const { data: facilities } = await supabase
    .from("facilities")
    .select(`
      id,
      title,
      slug,
      short_description,
      cover_image,
      is_published,
      display_order,
      updated_at,
      facility_images (id)
    `)
    .order("display_order", { ascending: true });

  if (!facilities || facilities.length === 0) {
    return (
      <div>
        <AdminPageHeader
          title="Facilities"
          description="Manage campus facilities, galleries, and public visibility."
          action={
            <Link
              href="/admin/facilities/new"
              className="inline-flex items-center gap-2 bg-brass px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-brass/90"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Facility
            </Link>
          }
        />
        <AdminEmptyState>No facilities yet. Create your first facility to get started.</AdminEmptyState>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Facilities"
        description="Manage campus facilities, galleries, and public visibility."
        action={
          <Link
            href="/admin/facilities/new"
            className="inline-flex items-center gap-2 bg-brass px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-brass/90"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Facility
          </Link>
        }
      />

      <AdminCard className="divide-y divide-ink/10">
        {facilities?.map((facility) => {
          const imageCount = facility.facility_images?.length ?? 0;
          return (
            <div key={facility.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
              <div className="flex items-center gap-4 min-w-0">
                {facility.cover_image && (
                  <div className="flex-shrink-0 relative h-16 w-24 overflow-hidden rounded-md bg-ink/5">
                    <img
                      src={facility.cover_image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{facility.title}</p>
                  <p className="mt-1 text-xs text-charcoal/50 truncate max-w-xs">
                    {facility.short_description || "No description"}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-charcoal/50">
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/50">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {facility.facility_images?.length ?? 0} / 10 images
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/50">
                        <line x1="10" y1="19" x2="10" y2="5" />
                        <line x1="6" y1="12" x2="14" y2="12" />
                        <line x1="18" y1="12" x2="18" y2="12" />
                        <line x1="22" y1="19" x2="22" y2="5" />
                      </svg>
                      Order: {facility.display_order}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <AdminBadge tone={facility.is_published ? "green" : "slate"}>
                  {facility.is_published ? "Published" : "Draft"}
                </AdminBadge>
                <Link
                  href={`/admin/facilities/${facility.id}/gallery`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal/60 hover:text-ink border border-ink/15 rounded-lg transition hover:bg-ink/5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/50">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Gallery
                </Link>
                <Link
                  href={`/admin/facilities/${facility.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal/60 hover:text-ink border border-ink/15 rounded-lg transition hover:bg-ink/5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/50">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3 3z" />
                  </svg>
                  Edit
                </Link>
                <DeleteFacilityButton facilityId={facility.id} facilityTitle={facility.title} />
              </div>
            </div>
          )
        })}
      </AdminCard>
    </div>
  );
}