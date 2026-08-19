"use client";

import { useState } from "react";
import { ImagePlus, MapPin } from "lucide-react";
import { AdminCard, AdminButton, AdminBadge } from "@/components/admin/admin-ui";

type PostFormProps = {
  action: (formData: FormData) => void;
  defaultValues?: {
    title: string;
    body: string;
    published: boolean;
    image_url?: string | null;
    location?: string | null;
    created_at?: string | null;
  };
  error?: string;
};

const EXCERPT_TARGET = 200;

// Converts an ISO timestamp into the "YYYY-MM-DDTHH:mm" format a
// <input type="datetime-local"> expects, in the browser's local time.
function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function PostForm({ action, defaultValues, error }: PostFormProps) {
  const [body, setBody] = useState(defaultValues?.body ?? "");
  const [published, setPublished] = useState(defaultValues?.published ?? false);
  const [preview, setPreview] = useState<string | null>(defaultValues?.image_url ?? null);

  return (
    <form action={action}>
      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <AdminCard className="p-6">
            <input
              name="title"
              type="text"
              required
              placeholder="Post title"
              defaultValue={defaultValues?.title}
              className="w-full border-0 border-b border-ink/10 pb-3 text-2xl text-ink outline-none placeholder:text-charcoal/30 focus:border-brass"
              style={{ fontFamily: "var(--font-display)" }}
            />

            <div className="mt-4 flex items-center gap-2 text-charcoal/50">
              <MapPin size={15} className="shrink-0" />
              <input
                name="location"
                type="text"
                placeholder="Location — e.g. FDSA Campus, Lapu-Lapu City"
                defaultValue={defaultValues?.location ?? ""}
                className="w-full border-0 py-1 text-sm text-ink outline-none placeholder:text-charcoal/40"
              />
            </div>

            <textarea
              name="body"
              rows={16}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the post body…"
              className="mt-5 w-full resize-y border-t border-ink/10 pt-5 text-sm leading-6 text-ink outline-none placeholder:text-charcoal/30"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-charcoal/40">
              <span>The first ~140–200 characters show as the excerpt on news cards.</span>
              <span className={body.length > EXCERPT_TARGET ? "text-brass" : ""}>
                {body.length} chars
              </span>
            </div>
          </AdminCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <AdminCard className="p-5">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">
                Publish
              </h3>
              <AdminBadge tone={published ? "green" : "slate"}>
                {published ? "Published" : "Draft"}
              </AdminBadge>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between">
              <span className="text-sm text-ink">Visible to the public</span>
              <span className="relative inline-flex items-center">
                <input
                  name="published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-ink/15 transition-colors peer-checked:bg-brass" />
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-ink">Post date &amp; time</span>
              <input
                name="created_at"
                type="datetime-local"
                defaultValue={toDatetimeLocal(defaultValues?.created_at)}
                className="mt-1.5 w-full rounded-md border border-ink/15 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brass"
              />
              <span className="mt-1 block text-xs text-charcoal/40">
                Controls the date shown on the post and its sort order.
              </span>
            </label>

            <AdminButton type="submit" className="mt-5 w-full justify-center">
              Save
            </AdminButton>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="border-b border-ink/10 pb-3 text-sm font-semibold uppercase tracking-wide text-ink">
              Featured image
            </h3>

            <label className="mt-4 block cursor-pointer">
              <div className="group relative aspect-[4/3] w-full overflow-hidden border border-dashed border-ink/20 bg-ink/[0.02] transition-colors hover:border-brass/50">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-charcoal/40">
                    <ImagePlus size={22} />
                    <span className="text-xs">Click to upload</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs font-medium text-parchment opacity-0 transition-opacity group-hover:opacity-100">
                  {preview ? "Replace image" : "Choose file"}
                </div>
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </label>
            <p className="mt-2 text-xs text-charcoal/40">
              Shown on news cards. Optional — leave blank for a text-only card.
            </p>
          </AdminCard>
        </div>
      </div>
    </form>
  );
}