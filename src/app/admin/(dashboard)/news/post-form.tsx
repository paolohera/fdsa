"use client";

import { AdminCard, AdminButton } from "@/components/admin/admin-ui";

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
    <form action={action} className="max-w-2xl">
      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminCard className="space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Featured image
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
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            {defaultValues?.image_url
              ? "Choose a file to replace the current image."
              : "Shown on news cards. Optional — leave blank for a text-only card."}
          </p>
        </div>

        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={defaultValues?.title}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={10}
            required
            defaultValue={defaultValues?.body}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            The first ~140 characters show as the excerpt on news cards.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            name="published"
            type="checkbox"
            defaultChecked={defaultValues?.published}
            className="h-4 w-4 rounded border-slate-300 text-ink focus:ring-ink"
          />
          Published (visible to the public)
        </label>

        <AdminButton type="submit">Save</AdminButton>
      </AdminCard>
    </form>
  );
}