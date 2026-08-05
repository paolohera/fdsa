import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { uploadAboutImage, deleteAboutImage } from "./actions";

export default async function AboutImagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("about_image")
    .select("id, image_url, storage_path")
    .maybeSingle();

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">About section image</h1>
      <p className="mt-1 text-sm text-slate-500">
        The photo shown on the homepage &quot;About FDSA&quot; preview. Only
        one image is used at a time — uploading a new one replaces it.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {image ? (
        <div className="mt-6 max-w-sm rounded-lg border border-slate-200 bg-white p-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-slate-100">
            <Image
              src={image.image_url}
              alt="About section"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <form action={uploadAboutImage} className="mt-4 flex items-center gap-2">
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

          <form action={deleteAboutImage.bind(null, image.id, image.storage_path)} className="mt-2">
            <button
              type="submit"
              className="text-sm text-slate-400 hover:text-red-600"
            >
              Delete
            </button>
          </form>
        </div>
      ) : (
        <form
          action={uploadAboutImage}
          className="mt-6 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
        >
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="flex-1 text-sm"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add image
          </button>
        </form>
      )}
    </div>
  );
}