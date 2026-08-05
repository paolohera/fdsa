import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  uploadHeroImage,
  replaceHeroImage,
  deleteHeroImage,
  moveHeroImage,
} from "./actions";

export default async function HeroImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("hero_images")
    .select("id, image_url, storage_path, position")
    .order("position", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Homepage carousel</h1>
      <p className="mt-1 text-sm text-slate-500">
        Images shown in the homepage hero slideshow, in order. The public
        site auto-advances every 3 seconds.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Upload new slide */}
      <form
        action={uploadHeroImage}
        className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
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
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add slide
        </button>
      </form>

      {/* Existing slides */}
      <div className="mt-6 space-y-4">
        {(!images || images.length === 0) && (
          <p className="text-sm text-slate-500">
            No slides yet. Add the first image above.
          </p>
        )}

        {images?.map((image, index) => (
          <div
            key={image.id}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <span className="w-6 text-center text-sm font-medium text-slate-400">
              {index + 1}
            </span>

            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-slate-100">
              <Image
                src={image.image_url}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex flex-col gap-1">
              <form action={moveHeroImage.bind(null, image.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  &uarr; Move up
                </button>
              </form>
              <form action={moveHeroImage.bind(null, image.id, "down")}>
                <button
                  type="submit"
                  disabled={!images || index === images.length - 1}
                  className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  &darr; Move down
                </button>
              </form>
            </div>

            <form
              action={replaceHeroImage.bind(null, image.id, image.storage_path)}
              className="flex flex-1 items-center gap-2"
            >
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

            <form action={deleteHeroImage.bind(null, image.id, image.storage_path)}>
              <button
                type="submit"
                className="text-sm text-slate-400 hover:text-red-600"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}