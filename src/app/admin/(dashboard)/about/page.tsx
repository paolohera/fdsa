import Image from "next/image";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { uploadAboutImage, deleteAboutImage } from "./actions";
import { AdminPageHeader, AdminCard, AdminButton } from "@/components/admin/admin-ui";

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
      <AdminPageHeader
        title="About section image"
        description={'The photo shown on the homepage "About FDSA" preview. Only one image is used at a time — uploading a new one replaces it.'}
      />

      {error && (
        <p className="mb-4 max-w-sm rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {image ? (
        <AdminCard className="max-w-sm p-4">
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
              className="flex-1 text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <AdminButton variant="secondary" type="submit">
              Replace
            </AdminButton>
          </form>

          <form action={deleteAboutImage.bind(null, image.id, image.storage_path)} className="mt-2">
            <AdminButton variant="danger" type="submit">
              <Trash2 size={14} /> Delete
            </AdminButton>
          </form>
        </AdminCard>
      ) : (
        <AdminCard className="max-w-sm p-6">
          <form action={uploadAboutImage} className="flex items-center gap-2">
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <AdminButton type="submit">Add image</AdminButton>
          </form>
        </AdminCard>
      )}
    </div>
  );
}