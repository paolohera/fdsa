import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteSlide, moveSlide } from "./actions";
import {
  AdminPageHeader,
  AdminCard,
  AdminLinkButton,
  AdminButton,
  AdminEmptyState,
} from "@/components/admin/admin-ui";

export default async function HeroSlidesPage() {
  const supabase = await createClient();

  const { data: slides } = await supabase
    .from("hero_slides")
    .select("id, image_url, title, storage_path, position")
    .order("position", { ascending: true });

  return (
    <div>
      <AdminPageHeader
        title="Homepage hero slides"
        description="Program spotlight slides shown on the homepage. Auto-advances every 3 seconds on the public site."
        action={
          <AdminLinkButton href="/admin/hero/new">
            <Plus size={16} /> New slide
          </AdminLinkButton>
        }
      />

      {(!slides || slides.length === 0) ? (
        <AdminEmptyState>No slides yet. Create the first one.</AdminEmptyState>
      ) : (
        <AdminCard className="divide-y divide-slate-100">
          {slides.map((slide, index) => (
            <div key={slide.id} className="flex items-center gap-4 p-4">
              <span className="w-5 text-center text-sm font-medium text-slate-400">
                {index + 1}
              </span>

              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100">
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

              <div className="flex items-center gap-1">
                <form action={moveSlide.bind(null, slide.id, "up")}>
                  <AdminButton variant="ghost" disabled={index === 0}>
                    <ArrowUp size={15} />
                  </AdminButton>
                </form>
                <form action={moveSlide.bind(null, slide.id, "down")}>
                  <AdminButton variant="ghost" disabled={index === slides.length - 1}>
                    <ArrowDown size={15} />
                  </AdminButton>
                </form>
                <Link href={`/admin/hero/${slide.id}`}>
                  <AdminButton variant="ghost" type="button">
                    <Pencil size={15} />
                  </AdminButton>
                </Link>
                <form action={deleteSlide.bind(null, slide.id, slide.storage_path)}>
                  <AdminButton variant="danger">
                    <Trash2 size={15} />
                  </AdminButton>
                </form>
              </div>
            </div>
          ))}
        </AdminCard>
      )}
    </div>
  );
}