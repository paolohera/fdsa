import { createSlide } from "../actions";
import { AdminPageHeader, AdminCard, AdminButton } from "@/components/admin/admin-ui";

export default async function NewSlidePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <AdminPageHeader title="New hero slide" />

      <form action={createSlide} className="max-w-lg">
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <AdminCard className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Student photo
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Program title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="Associate in Aircraft Maintenance Technology"
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
              placeholder="A short blurb about this program."
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
                defaultValue="Enroll Now"
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
                defaultValue="/programs"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>

          <AdminButton type="submit">Create slide</AdminButton>
          <p className="text-xs text-slate-400">
            You&apos;ll be able to add stats (e.g. &quot;150+ Students
            Enrolled&quot;) after creating the slide.
          </p>
        </AdminCard>
      </form>
    </div>
  );
}