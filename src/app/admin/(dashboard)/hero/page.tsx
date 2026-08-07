import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteSlide, moveSlide } from "./actions";

export default async function HeroSlidesPage() {
  const supabase = await createClient();

  const { data: slides } = await supabase
    .from("hero_slides")
    .select("id, image_url, title, storage_path, position")
    .order("position", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Homepage hero slides
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Program spotlight slides shown on the homepage. Auto-advances
            every 3 seconds on the public site.
          </p>
        </div>
        <Link
          href="/admin/hero/new"
          className="whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New slide
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {(!slides || slides.length === 0) && (
          <p className="text-sm text-slate-500">
            No slides yet. Create the first one.
          </p>
        )}

        {slides?.map((slide, index) => (
          <div
            key={slide.id}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <span className="w-6 text-center text-sm font-medium text-slate-400">
              {index + 1}
            </span>

            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100">
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <Link
              href={`/admin/hero/${slide.id}`}
              className="flex-1 text-sm font-medium text-slate-900 hover:underline"
            >
              {slide.title}
            </Link>

            <div className="flex flex-col gap-1">
              <form action={moveSlide.bind(null, slide.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  &uarr; Move up
                </button>
              </form>
              <form action={moveSlide.bind(null, slide.id, "down")}>
                <button
                  type="submit"
                  disabled={!slides || index === slides.length - 1}
                  className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-30"
                >
                  &darr; Move down
                </button>
              </form>
            </div>

            <Link
              href={`/admin/hero/${slide.id}`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </Link>

            <form action={deleteSlide.bind(null, slide.id, slide.storage_path)}>
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