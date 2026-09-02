export const MAX_GALLERY_IMAGES = 25;

export type GalleryImage = {
  id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
};