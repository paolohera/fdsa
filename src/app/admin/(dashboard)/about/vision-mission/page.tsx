import { createClient } from "@/lib/supabase/server";
import { updateVisionMission } from "./actions";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import VisionMissionEntryForm from "./entry-form";

export default async function VisionMissionPage() {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("vision_mission")
    .select("id, key, label, heading, body, image_url")
    .order("key", { ascending: false }); // "vision" before "mission"

  return (
    <div>
      <AdminPageHeader
        title="Vision & Mission"
        description="Text and photo shown in the Vision & Mission section of the About page."
      />

      <div className="space-y-6">
        {entries?.map((entry) => (
          <VisionMissionEntryForm
            key={entry.id}
            action={updateVisionMission.bind(null, entry.id)}
            label={entry.label}
            defaultValues={entry}
          />
        ))}
      </div>
    </div>
  );
}