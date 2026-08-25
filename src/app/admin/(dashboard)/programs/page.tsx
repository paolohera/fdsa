import { createClient } from "@/lib/supabase/server";
import { updateProgramImage, removeProgramImage, createCustomProgramCard, deleteCustomProgramCard } from "./actions";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";
import ProgramImageForm from "./program-image-form";
import RemoveProgramImageButton from "./remove-program-image-button";
import AddCustomCardForm from "./add-custom-card-form";
import DeleteCustomCardButton from "./delete-custom-card-button";

const PROGRAM_LABELS: Record<string, string> = {
  BAMT: "Bachelor in Aircraft Maintenance Technology",
  BAET: "Bachelor in Aviation Electronics Technology",
  AMT: "Aircraft Maintenance Technology",
  AET: "Aviation Electronics Technology",
  STEM: "Science, Technology, Engineering, & Mathematics",
  ABM: "Accountancy, Business, and Management",
  GAS: "General Academic Strand",
};

const FIXED_PROGRAM_ORDER = ["BAMT", "BAET", "AMT", "AET", "STEM", "ABM", "GAS"];
const MAX_TOTAL_CARDS = 10;

export default async function ProgramImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("program_images")
    .select("program_code, image_url, storage_path, label, is_custom");

  const byCode = new Map((images ?? []).map((img) => [img.program_code, img]));
  const customCards = (images ?? []).filter((img) => img.is_custom);
  const totalCards = FIXED_PROGRAM_ORDER.length + customCards.length;
  const remainingSlots = Math.max(0, MAX_TOTAL_CARDS - totalCards);

  return (
    <div>
      <AdminPageHeader
        title="Program images"
        description="Photos shown on the /programs page for each individual program."
      />

      {error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIXED_PROGRAM_ORDER.map((code) => {
          const img = byCode.get(code);
          const updateWithCode = updateProgramImage.bind(null, code);
          const removeWithCode = removeProgramImage.bind(null, code, img?.storage_path ?? null);

          return (
            <AdminCard key={code} className="p-5">
              <ProgramImageForm
                key={img?.image_url ?? "empty"}
                action={updateWithCode}
                currentImageUrl={img?.image_url}
                code={code}
              />

              <p className="mt-3 text-sm font-semibold text-ink">{code}</p>
              <p className="mt-0.5 text-xs leading-4 text-charcoal/50">{PROGRAM_LABELS[code]}</p>

              {img?.image_url && (
                <div className="mt-3">
                  <RemoveProgramImageButton code={code} removeAction={removeWithCode} />
                </div>
              )}
            </AdminCard>
          );
        })}

        {customCards.map((img) => {
          const updateWithCode = updateProgramImage.bind(null, img.program_code);
          const removeWithCode = removeProgramImage.bind(null, img.program_code, img.storage_path);
          const deleteWithCode = deleteCustomProgramCard.bind(null, img.program_code, img.storage_path);

          return (
            <AdminCard key={img.program_code} className="border-brass/30 p-5">
              <ProgramImageForm
                key={img.image_url ?? "empty"}
                action={updateWithCode}
                currentImageUrl={img.image_url}
                code={img.program_code}
              />

              <p className="mt-3 text-sm font-semibold text-ink">{img.program_code}</p>
              <p className="mt-0.5 text-xs leading-4 text-charcoal/50">{img.label}</p>

              <div className="mt-3 space-y-2">
                {img.image_url && <RemoveProgramImageButton code={img.program_code} removeAction={removeWithCode} />}
                <DeleteCustomCardButton code={img.program_code} deleteAction={deleteWithCode} />
              </div>
            </AdminCard>
          );
        })}

        <AddCustomCardForm action={createCustomProgramCard} remainingSlots={remainingSlots} />
      </div>
    </div>
  );
}