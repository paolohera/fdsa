import { createClient } from "@/lib/supabase/server";
import { updateDevNotice } from "./actions";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";
import DevNoticeForm from "./dev-notice-form";

export default async function DevNoticePage() {
  const supabase = await createClient();

  const { data: notice } = await supabase
    .from("dev_notice")
    .select("enabled, title, message, old_site_url")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div>
      <AdminPageHeader
        title="Development Notice"
        description="An intro modal shown once per visitor, warning the site is still under construction, with an optional link to the old website. Saving shows it again to everyone — even people who already dismissed it."
      />

      <AdminCard className="max-w-xl p-6">
        <DevNoticeForm
          action={updateDevNotice}
          notice={notice ?? { enabled: true, title: "", message: "", old_site_url: "" }}
        />
      </AdminCard>
    </div>
  );
}