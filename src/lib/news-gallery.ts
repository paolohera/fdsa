export const MAX_GALLERY_IMAGES = 10;

export type GalleryImage = {
  id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
};