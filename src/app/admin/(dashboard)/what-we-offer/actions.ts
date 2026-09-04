"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, sanitizeError } from "@/lib/admin-auth";
import { MAX_PROGRAM_GALLERY_IMAGES } from "@/lib/homepage-gallery";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function createHomepageProgram(formData: FormData) {
  const { supabase } = await requireAdmin();

  const code = (formData.get("code") as string)?.trim();
  const track = (formData.get("track") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const linkHref = (formData.get("link_href") as string)?.trim() || "/programs";
  const file = formData.get("image") as File | null;

  if (!code || !track || !name || !description) {
    throw new Error("Please fill in code, track, name, and description.");
  }

  if (code.length > 20) throw new Error("Code must be 20 characters or less.");
  if (name.length > 100) throw new Error("Name must be 100 characters or less.");
  if (description.length > 500) throw new Error("Description must be 500 characters or less.");
  if (linkHref.length > 200) throw new Error("Link must be 200 characters or less.");

  let imageUrl: string | null = null;
  let storagePath: string | null = null;

  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be less than 5MB.");
    if (!file.type.startsWith("image/")) throw new Error("File must be an image.");

    const path = randomFileName(file.name);
    const { error: uploadError } = await supabase.storage.from("program-images").upload(path, file);
    if (uploadError) throw new Error(sanitizeError(uploadError));

    const {
      data: { publicUrl },
    } = supabase.storage.from("program-images").getPublicUrl(path);
    imageUrl = publicUrl;
    storagePath = path;
  }

  const { count } = await supabase
    .from("homepage_programs")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase.from("homepage_programs").insert({
    code,
    track,
    name,
    description,
    link_href: linkHref,
    image_url: imageUrl,
    storage_path: storagePath,
    sort_order: count ?? 0,
  });

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function updateHomepageProgram(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const code = (formData.get("code") as string)?.trim();
  const track = (formData.get("track") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const linkHref = (formData.get("link_href") as string)?.trim() || "/programs";

  if (!code || !track || !name || !description) {
    throw new Error("Please fill in code, track, name, and description.");
  }

  if (code.length > 20) throw new Error("Code must be 20 characters or less.");
  if (name.length > 100) throw new Error("Name must be 100 characters or less.");
  if (description.length > 500) throw new Error("Description must be 500 characters or less.");
  if (linkHref.length > 200) throw new Error("Link must be 200 characters or less.");

  const { error } = await supabase
    .from("homepage_programs")
    .update({ code, track, name, description, link_href: linkHref })
    .eq("id", id);

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function updateHomepageProgramImage(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be less than 5MB.");
  if (!file.type.startsWith("image/")) throw new Error("File must be an image.");

  const { data: existing } = await supabase
    .from("homepage_programs")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const path = randomFileName(file.name);
  const { error: uploadError } = await supabase.storage.from("program-images").upload(path, file);
  if (uploadError) throw new Error(`Storage upload failed: ${sanitizeError(uploadError)}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("program-images").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("homepage_programs")
    .update({ image_url: publicUrl, storage_path: path })
    .eq("id", id);

  if (updateError) throw new Error(`Database update failed: ${sanitizeError(updateError)}`);

  if (existing?.storage_path) {
    await supabase.storage.from("program-images").remove([existing.storage_path]);
  }

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function removeHomepageProgramImage(id: string, storagePath: string | null) {
  const { supabase } = await requireAdmin();

  if (storagePath) {
    await supabase.storage.from("program-images").remove([storagePath]);
  }

  const { error } = await supabase
    .from("homepage_programs")
    .update({ image_url: null, storage_path: null })
    .eq("id", id);

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function deleteHomepageProgram(id: string, storagePath: string | null) {
  const { supabase } = await requireAdmin();

  const { data: galleryImages } = await supabase
    .from("homepage_program_images")
    .select("storage_path")
    .eq("program_id", id);

  const pathsToRemove = [
    ...(storagePath ? [storagePath] : []),
    ...(galleryImages ?? []).map((g) => g.storage_path),
  ];

  if (pathsToRemove.length > 0) {
    await supabase.storage.from("program-images").remove(pathsToRemove);
  }

  // homepage_program_images rows are removed automatically via the FK's
  // `on delete cascade`.
  const { error } = await supabase.from("homepage_programs").delete().eq("id", id);
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

// Mutually exclusive — featuring a card automatically un-features whichever
// one currently holds it, so there's never more than one at a time.
export async function toggleHomepageProgramFeatured(id: string, currentlyFeatured: boolean) {
  const { supabase } = await requireAdmin();

  if (currentlyFeatured) {
    const { error } = await supabase
      .from("homepage_programs")
      .update({ is_featured: false })
      .eq("id", id);
    if (error) throw new Error(sanitizeError(error));
  } else {
    const { error: clearError } = await supabase
      .from("homepage_programs")
      .update({ is_featured: false })
      .neq("id", id);
    if (clearError) throw new Error(sanitizeError(clearError));

    const { error: setError } = await supabase
      .from("homepage_programs")
      .update({ is_featured: true })
      .eq("id", id);
    if (setError) throw new Error(sanitizeError(setError));
  }

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function moveHomepageProgram(id: string, direction: "up" | "down") {
  const { supabase } = await requireAdmin();

  const { data: items } = await supabase
    .from("homepage_programs")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!items) return;

  const index = items.findIndex((item) => item.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const swap = items[swapIndex];

  const { error: e1 } = await supabase
    .from("homepage_programs")
    .update({ sort_order: swap.sort_order })
    .eq("id", current.id);
  if (e1) throw new Error(sanitizeError(e1));

  const { error: e2 } = await supabase
    .from("homepage_programs")
    .update({ sort_order: current.sort_order })
    .eq("id", swap.id);
  if (e2) throw new Error(sanitizeError(e2));

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

// Uploads gallery files in parallel and inserts one row per successful
// upload, capped at MAX_PROGRAM_GALLERY_IMAGES total for the program.
// CSRF is checked the same way as the other mutating actions here.
export async function addHomepageProgramGalleryImages(programId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const files = formData
    .getAll("gallery")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return;

  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) throw new Error("Each image must be less than 5MB.");
    if (!file.type.startsWith("image/")) throw new Error("All files must be images.");
  }

  const { count } = await supabase
    .from("homepage_program_images")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId);

  const remaining = MAX_PROGRAM_GALLERY_IMAGES - (count ?? 0);
  if (remaining <= 0) {
    throw new Error(`This card already has the maximum of ${MAX_PROGRAM_GALLERY_IMAGES} gallery images.`);
  }

  const startOrder = count ?? 0;
  const toUpload = files.slice(0, remaining);

  type GalleryRow = {
    program_id: string;
    image_url: string;
    storage_path: string;
    sort_order: number;
  };
  type UploadResult = { row: GalleryRow } | { error: { message: string } };

  const results: UploadResult[] = await Promise.all(
    toUpload.map(async (file, i): Promise<UploadResult> => {
      const path = `gallery/${programId}/${randomFileName(file.name)}`;
      const { error } = await supabase.storage.from("program-images").upload(path, file);
      if (error) return { error: { message: sanitizeError(error) } };

      const {
        data: { publicUrl },
      } = supabase.storage.from("program-images").getPublicUrl(path);

      return {
        row: {
          program_id: programId,
          image_url: publicUrl,
          storage_path: path,
          sort_order: startOrder + i,
        },
      };
    })
  );

  const rows = results.filter((r): r is { row: GalleryRow } => "row" in r).map((r) => r.row);

  if (rows.length > 0) {
    const { error } = await supabase.from("homepage_program_images").insert(rows);
    if (error) throw new Error(sanitizeError(error));
  }

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}

export async function deleteHomepageProgramGalleryImage(
  imageId: string,
  storagePath: string
) {
  const { supabase } = await requireAdmin();

  await supabase.storage.from("program-images").remove([storagePath]);
  const { error } = await supabase.from("homepage_program_images").delete().eq("id", imageId);
  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/what-we-offer");
  revalidatePath("/");
}