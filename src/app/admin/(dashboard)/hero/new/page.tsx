import { createSlide } from "../actions";

export default async function NewSlidePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">New hero slide</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={createSlide} className="mt-6 max-w-lg space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Student photo
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="w-full text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Program title
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Associate in Aircraft Maintenance Technology"
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
            placeholder="A short blurb about this program."
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
              defaultValue="Enroll Now"
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
              defaultValue="/programs"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Create slide
        </button>
        <p className="text-xs text-slate-400">
          You&apos;ll be able to add stats (e.g. &quot;150+ Students
          Enrolled&quot;) after creating the slide.
        </p>
      </form>
    </div>
  );
}