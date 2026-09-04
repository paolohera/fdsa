export const MAX_PROGRAM_GALLERY_IMAGES = 10;

export type ProgramGalleryImage = {
  id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
};