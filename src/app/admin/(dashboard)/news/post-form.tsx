"use client";

type PostFormProps = {
  action: (formData: FormData) => void;
  defaultValues?: {
    title: string;
    body: string;
    published: boolean;
    image_url?: string | null;
  };
  error?: string;
};

export default function PostForm({ action, defaultValues, error }: PostFormProps) {
  return (
    <form action={action} className="space-y-5 max-w-2xl">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Featured image (optional)
        </label>
        {defaultValues?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={defaultValues.image_url}
            alt=""
            className="mb-2 h-32 w-full max-w-xs rounded-md border border-slate-200 object-cover"
          />
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          className="w-full text-sm"
        />
        <p className="mt-1 text-xs text-slate-400">
          {defaultValues?.image_url
            ? "Choose a file to replace the current image."
            : "Shown on news cards. Leave blank for a text-only card."}
        </p>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues?.title}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-1 block text-sm font-medium text-slate-700">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={10}
          required
          defaultValue={defaultValues?.body}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
        <p className="mt-1 text-xs text-slate-400">
          The first ~140 characters show as the excerpt on news cards.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={defaultValues?.published}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="published" className="text-sm text-slate-700">
          Published (visible to the public)
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Save
      </button>
    </form>
  );
}