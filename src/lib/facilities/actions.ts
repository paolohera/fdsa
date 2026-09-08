"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, sanitizeError } from "@/lib/admin-auth";

export interface Facility {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  cover_image: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FacilityImage {
  id: string;
  facility_id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string | null;
  is_cover: boolean;
  display_order: number;
  created_at: string;
}

export async function getFacilities(options?: {
  publishedOnly?: boolean;
}): Promise<Facility[]> {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("facilities")
    .select(`
      id,
      title,
      slug,
      short_description,
      full_description,
      cover_image,
      is_published,
      display_order,
      created_at,
      updated_at,
      facility_images (id)
    `)
    .order("display_order", { ascending: true });

  if (options?.publishedOnly) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(sanitizeError(error));

  return (data ?? []) as Facility[];
}

export async function getFacility(id: string): Promise<Facility | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("facilities")
    .select(`
      id,
      title,
      slug,
      short_description,
      full_description,
      cover_image,
      is_published,
      display_order,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(sanitizeError(error));
  }

  return data as Facility;
}

export async function getFacilityWithImages(id: string): Promise<{ facility: Facility; images: FacilityImage[] } | null> {
  const { supabase } = await requireAdmin();

  const { data: facility, error: facilityError } = await supabase
    .from("facilities")
    .select(`
      id,
      title,
      slug,
      short_description,
      full_description,
      cover_image,
      is_published,
      display_order,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (facilityError) {
    if (facilityError.code === "PGRST116") return null;
    throw new Error(sanitizeError(facilityError));
  }

  const { data: images, error: imagesError } = await supabase
    .from("facility_images")
    .select("*")
    .eq("facility_id", id)
    .order("display_order", { ascending: true });

  if (imagesError) throw new Error(sanitizeError(imagesError));

  return { facility: facility as Facility, images: (images ?? []) as FacilityImage[] };
}

export async function createFacility(formData: FormData): Promise<{ id: string }> {
  const { supabase } = await requireAdmin();

  const title = formData.get("title")?.toString().trim();
  const shortDescription = formData.get("short_description")?.toString().trim() || null;
  const fullDescription = formData.get("full_description")?.toString().trim() || null;
  const isPublished = formData.get("is_published") === "true";
  const displayOrder = parseInt(formData.get("display_order")?.toString() || "0", 10);

  if (!title) {
    throw new Error("Facility name is required");
  }

  // Generate slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const { data } = await supabase.from("facilities").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const { data, error } = await supabase
    .from("facilities")
    .insert({
      title,
      slug,
      short_description: shortDescription,
      full_description: fullDescription,
      is_published: isPublished,
      display_order: displayOrder,
    })
    .select("id")
    .single();

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/facilities");
  return { id: data.id };
}

export async function updateFacility(id: string, formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const title = formData.get("title")?.toString().trim();
  const shortDescription = formData.get("short_description")?.toString().trim() || null;
  const fullDescription = formData.get("full_description")?.toString().trim() || null;
  const isPublished = formData.get("is_published") === "true";
  const displayOrder = parseInt(formData.get("display_order")?.toString() || "0", 10);

  if (!title) {
    throw new Error("Facility name is required");
  }

  const { error } = await supabase
    .from("facilities")
    .update({
      title,
      short_description: shortDescription,
      full_description: fullDescription,
      is_published: isPublished,
      display_order: displayOrder,
    })
    .eq("id", id);

  if (error) throw new Error(sanitizeError(error));

  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${id}`);
  revalidatePath("/admin/facilities");
}

export async function deleteFacility(id: string): Promise<void> {
  const { supabase } = await requireAdmin();

  // Get images to delete from storage
  const { data: images } = await supabase
    .from("facility_images")
    .select("storage_path")
    .eq("facility_id", id);

  // Delete facility (cascades to facility_images)
  const { error } = await supabase.from("facilities").delete().eq("id", id);

  if (error) throw new Error(sanitizeError(error));

  // Delete storage files
  if (images?.length) {
    const paths = images.map((img) => img.storage_path).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from("facility-images").remove(paths);
    }
  }

  revalidatePath("/admin/facilities");
  revalidatePath("/facilities");
}

export async function uploadFacilityImage(
  facilityId: string,
  file: File,
  altText: string | null = null,
  isCover: boolean = false
): Promise<{ id: string; image_url: string }> {
  const { supabase } = await requireAdmin();

  // Check current image count
  const { count, error: countError } = await supabase
    .from("facility_images")
    .select("*", { count: "exact", head: true })
    .eq("facility_id", facilityId);

  if (countError) throw new Error(sanitizeError(countError));

  if ((count ?? 0) >= 10) {
    throw new Error("Maximum of 10 images per facility reached. Please delete an image before adding a new one.");
  }

  // Upload to storage
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const allowedExts = ["jpg", "jpeg", "png", "webp"];
  if (!fileExt || !allowedExts.includes(fileExt)) {
    throw new Error("Invalid file type. Please upload JPG, PNG, or WebP images only.");
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const storagePath = `facilities/${facilityId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("facility-images")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(sanitizeError(uploadError));

  // Get public URL
  const { data: urlData } = supabase.storage.from("facility-images").getPublicUrl(storagePath);

  // Get max display order
  const { data: maxOrder } = await supabase
    .from("facility_images")
    .select("display_order")
    .eq("facility_id", facilityId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder?.display_order ?? -1) + 1;

  // Insert image record
  const { data, error } = await supabase
    .from("facility_images")
    .insert({
      facility_id: facilityId,
      image_url: urlData.publicUrl,
      storage_path: storagePath,
      alt_text: altText,
      is_cover: isCover,
      display_order: nextOrder,
    })
    .select("id, image_url")
    .single();

  if (error) {
    // Clean up storage file on DB error
    await supabase.storage.from("facility-images").remove([storagePath]);
    throw new Error(sanitizeError(error));
  }

  // If this is the cover image, update facility cover_image
  if (isCover) {
    await supabase
      .from("facilities")
      .update({ cover_image: urlData.publicUrl })
      .eq("id", facilityId);
  }

  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${facilityId}/gallery`);

  return { id: data.id, image_url: data.image_url };
}

export async function deleteFacilityImage(imageId: string, facilityId: string): Promise<void> {
  const { supabase } = await requireAdmin();

  // Get image info before deletion
  const { data: image } = await supabase
    .from("facility_images")
    .select("storage_path, image_url, is_cover")
    .eq("id", imageId)
    .single();

  if (!image) throw new Error("Image not found");

  // Delete from database
  const { error } = await supabase.from("facility_images").delete().eq("id", imageId);

  if (error) throw new Error(sanitizeError(error));

  // Delete from storage
  if (image.storage_path) {
    await supabase.storage.from("facility-images").remove([image.storage_path]);
  }

  // If this was the cover, clear facility cover_image
  if (image.is_cover) {
    await supabase
      .from("facilities")
      .update({ cover_image: null })
      .eq("id", facilityId);
  }

  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${facilityId}/gallery`);
}

export async function updateImageOrder(
  facilityId: string,
  imageOrders: { id: string; display_order: number }[]
): Promise<void> {
  const { supabase } = await requireAdmin();

  for (const { id, display_order } of imageOrders) {
    const { error } = await supabase
      .from("facility_images")
      .update({ display_order })
      .eq("id", id)
      .eq("facility_id", facilityId);

    if (error) throw new Error(sanitizeError(error));
  }

  revalidatePath(`/admin/facilities/${facilityId}/gallery`);
}

export async function setCoverImage(facilityId: string, imageId: string): Promise<void> {
  const { supabase } = await requireAdmin();

  // Get the new cover image URL
  const { data: image } = await supabase
    .from("facility_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("facility_id", facilityId)
    .single();

  if (!image) throw new Error("Image not found");

  // Set all images to not cover
  await supabase
    .from("facility_images")
    .update({ is_cover: false })
    .eq("facility_id", facilityId);

  // Set new cover
  const { error } = await supabase
    .from("facility_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (error) throw new Error(sanitizeError(error));

  // Update facility cover_image
  await supabase
    .from("facilities")
    .update({ cover_image: image.image_url })
    .eq("id", facilityId);

  revalidatePath(`/admin/facilities/${facilityId}/gallery`);
  revalidatePath("/admin/facilities");
}

export async function getFacilityImages(facilityId: string): Promise<FacilityImage[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("facility_images")
    .select("*")
    .eq("facility_id", facilityId)
    .order("display_order", { ascending: true });

  if (error) throw new Error(sanitizeError(error));

  return (data ?? []) as FacilityImage[];
}