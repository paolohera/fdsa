import { createClient } from "@/lib/supabase/server";
import {
  createHomepageProgram,
  updateHomepageProgram,
  updateHomepageProgramImage,
  removeHomepageProgramImage,
  deleteHomepageProgram,
  moveHomepageProgram,
  toggleHomepageProgramFeatured,
  addHomepageProgramGalleryImages,
  deleteHomepageProgramGalleryImage,
} from "./actions";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";
import HomepageProgramCard from "./homepage-program-card";
import AddHomepageProgramForm from "./add-homepage-program-form";

export default async function WhatWeOfferPage() {
  const supabase = await createClient();

  const { data: programs } = await supabase
    .from("homepage_programs")
    .select(
      "id, code, track, name, description, image_url, storage_path, link_href, sort_order, is_featured, homepage_program_images(id, image_url, storage_path, sort_order)"
    )
    .order("sort_order", { ascending: true });

  const items = (programs ?? []).map((item) => ({
    ...item,
    homepage_program_images: (item.homepage_program_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  return (
    <div>
      <AdminPageHeader
        title="What We Offer"
        description="Controls the program cards shown on the homepage, under the Academics / What We Offer heading. Feature a card to show it as the big carousel above the list."
      />

      <div className="space-y-4">
        {items.map((item, index) => (
          <HomepageProgramCard
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            updateTextAction={updateHomepageProgram.bind(null, item.id)}
            updateImageAction={updateHomepageProgramImage.bind(null, item.id)}
            removeImageAction={removeHomepageProgramImage.bind(null, item.id, item.storage_path)}
            deleteAction={deleteHomepageProgram.bind(null, item.id, item.storage_path)}
            moveUpAction={moveHomepageProgram.bind(null, item.id, "up")}
            moveDownAction={moveHomepageProgram.bind(null, item.id, "down")}
            toggleFeaturedAction={toggleHomepageProgramFeatured.bind(
              null,
              item.id,
              item.is_featured
            )}
            galleryImages={item.homepage_program_images}
            addGalleryAction={addHomepageProgramGalleryImages.bind(null, item.id)}
            deleteGalleryImageAction={deleteHomepageProgramGalleryImage}
          />
        ))}

        {items.length === 0 && (
          <AdminCard className="p-6 text-center text-sm text-charcoal/50">
            No cards yet — add one below. The homepage section stays empty until at least one
            card exists.
          </AdminCard>
        )}
      </div>

      <div className="mt-8">
        <AddHomepageProgramForm action={createHomepageProgram} />
      </div>
    </div>
  );
}