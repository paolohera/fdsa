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
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Student photo
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="block w-full text-sm text-charcoal/60 file:mr-3 file:border-0 file:bg-ink/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-ink/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Program title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="Associate in Aircraft Maintenance Technology"
              className="w-full border border-ink/20 px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Short description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="A short blurb about this program."
              className="w-full border border-ink/20 px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Button label
              </label>
              <input
                type="text"
                name="cta_label"
                defaultValue="Enroll Now"
                className="w-full border border-ink/20 px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Button link
              </label>
              <input
                type="text"
                name="cta_url"
                defaultValue="/programs"
                className="w-full border border-ink/20 px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
              />
            </div>
          </div>

          <AdminButton type="submit">Create slide</AdminButton>
          <p className="text-xs text-charcoal/40">
            You&apos;ll be able to add stats (e.g. &quot;150+ Students
            Enrolled&quot;) after creating the slide.
          </p>
        </AdminCard>
      </form>
    </div>
  );
}