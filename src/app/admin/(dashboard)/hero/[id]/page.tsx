import Image from "next/image";
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
      <h1 className="text-xl font-semibold text-slate-900">Edit hero slide</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Image */}
      <div className="mt-6 max-w-lg rounded-lg border border-slate-200 bg-white p-4">
        <div className="relative h-40 w-40 overflow-hidden rounded-full bg-slate-100">
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
            className="flex-1 text-xs"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Replace
          </button>
        </form>
      </div>

      {/* Details */}
      <form action={updateSlideDetailsWithId} className="mt-6 max-w-lg space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Program title
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={slide.title}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Short description
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={slide.description}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Button label
            </label>
            <input
              type="text"
              name="cta_label"
              defaultValue={slide.cta_label}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Button link
            </label>
            <input
              type="text"
              name="cta_url"
              defaultValue={slide.cta_url}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Save details
        </button>
      </form>

      {/* Stats */}
      <div className="mt-10 max-w-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Stats shown next to this slide
        </h2>

        <div className="mt-3 space-y-3">
          {(!stats || stats.length === 0) && (
            <p className="text-sm text-slate-500">
              No stats yet — add one below (e.g. &quot;150+&quot; /
              &quot;Students Enrolled&quot;).
            </p>
          )}

          {stats?.map((stat, index) => {
            const updateStatWithIds = updateStat.bind(null, id, stat.id);
            return (
              <div
                key={stat.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3"
              >
                <form
                  action={updateStatWithIds}
                  className="flex flex-1 items-center gap-2"
                >
                  <input
                    type="text"
                    name="value"
                    defaultValue={stat.value}
                    placeholder="150+"
                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                  />
                  <input
                    type="text"
                    name="label"
                    defaultValue={stat.label}
                    placeholder="Students Enrolled"
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Save
                  </button>
                </form>

                <form action={moveStat.bind(null, id, stat.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30"
                  >
                    &uarr;
                  </button>
                </form>
                <form action={moveStat.bind(null, id, stat.id, "down")}>
                  <button
                    type="submit"
                    disabled={!stats || index === stats.length - 1}
                    className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30"
                  >
                    &darr;
                  </button>
                </form>

                <form action={deleteStat.bind(null, id, stat.id)}>
                  <button
                    type="submit"
                    className="text-sm text-slate-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </form>
              </div>
            );
          })}
        </div>

        <form
          action={addStatWithId}
          className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 p-3"
        >
          <input
            type="text"
            name="value"
            placeholder="150+"
            required
            className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
          />
          <input
            type="text"
            name="label"
            placeholder="Students Enrolled"
            required
            className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            Add stat
          </button>
        </form>
      </div>
    </div>
  );
}