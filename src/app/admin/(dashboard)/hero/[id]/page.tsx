import Image from "next/image";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  updateSlideDetails,
  replaceSlideImage,
  addStat,
  updateStat,
  deleteStat,
  moveStat,
} from "../actions";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminEmptyState,
} from "@/components/admin/admin-ui";

export default async function EditSlidePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: slide } = await supabase
    .from("hero_slides")
    .select("id, image_url, storage_path, title, description, cta_label, cta_url")
    .eq("id", id)
    .single();

  if (!slide) notFound();

  const { data: stats } = await supabase
    .from("hero_slide_stats")
    .select("id, value, label, position")
    .eq("slide_id", id)
    .order("position", { ascending: true });

  const updateSlideDetailsWithId = updateSlideDetails.bind(null, id);
  const replaceSlideImageWithId = replaceSlideImage.bind(null, id, slide.storage_path);
  const addStatWithId = addStat.bind(null, id);

  return (
    <div>
      <AdminPageHeader title="Edit hero slide" />

      {error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Image */}
      <AdminCard className="max-w-lg p-6">
        <div className="relative h-36 w-36 overflow-hidden rounded-full bg-slate-100">
          <Image
            src={slide.image_url}
            alt={slide.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <form action={replaceSlideImageWithId} className="mt-4 flex items-center gap-2">
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="flex-1 text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          <AdminButton variant="secondary" type="submit">
            Replace
          </AdminButton>
        </form>
      </AdminCard>

      {/* Details */}
      <form action={updateSlideDetailsWithId} className="mt-6 max-w-lg">
        <AdminCard className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Program title
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={slide.title}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Short description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={slide.description}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Button label
              </label>
              <input
                type="text"
                name="cta_label"
                defaultValue={slide.cta_label}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Button link
              </label>
              <input
                type="text"
                name="cta_url"
                defaultValue={slide.cta_url}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>

          <AdminButton type="submit">Save details</AdminButton>
        </AdminCard>
      </form>

      {/* Stats */}
      <div className="mt-10 max-w-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Stats shown next to this slide
        </h2>

        {(!stats || stats.length === 0) ? (
          <div className="mt-3">
            <AdminEmptyState>
              No stats yet — add one below (e.g. &quot;150+&quot; /
              &quot;Students Enrolled&quot;).
            </AdminEmptyState>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {stats.map((stat, index) => {
              const updateStatWithIds = updateStat.bind(null, id, stat.id);
              return (
                <AdminCard key={stat.id} className="flex items-center gap-2 p-3">
                  <form
                    action={updateStatWithIds}
                    className="flex flex-1 items-center gap-2"
                  >
                    <input
                      type="text"
                      name="value"
                      defaultValue={stat.value}
                      placeholder="150+"
                      className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-ink"
                    />
                    <input
                      type="text"
                      name="label"
                      defaultValue={stat.label}
                      placeholder="Students Enrolled"
                      className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-ink"
                    />
                    <AdminButton variant="secondary" type="submit" className="px-3 py-1.5 text-xs">
                      Save
                    </AdminButton>
                  </form>

                  <form action={moveStat.bind(null, id, stat.id, "up")}>
                    <AdminButton variant="ghost" disabled={index === 0}>
                      <ArrowUp size={14} />
                    </AdminButton>
                  </form>
                  <form action={moveStat.bind(null, id, stat.id, "down")}>
                    <AdminButton variant="ghost" disabled={index === stats.length - 1}>
                      <ArrowDown size={14} />
                    </AdminButton>
                  </form>
                  <form action={deleteStat.bind(null, id, stat.id)}>
                    <AdminButton variant="danger">
                      <Trash2 size={14} />
                    </AdminButton>
                  </form>
                </AdminCard>
              );
            })}
          </div>
        )}

        <form
          action={addStatWithId}
          className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 p-3"
        >
          <input
            type="text"
            name="value"
            placeholder="150+"
            required
            className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-ink"
          />
          <input
            type="text"
            name="label"
            placeholder="Students Enrolled"
            required
            className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-ink"
          />
          <AdminButton type="submit" className="px-3 py-1.5 text-xs">
            Add stat
          </AdminButton>
        </form>
      </div>
    </div>
  );
}