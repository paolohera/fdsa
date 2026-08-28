import { createClient } from "@/lib/supabase/server";
import DevNoticeModal from "./dev-notice-modal";

export default async function DevNoticeGate() {
  const supabase = await createClient();

  const { data: notice } = await supabase
    .from("dev_notice")
    .select("enabled, title, message, old_site_url, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (!notice || !notice.enabled) return null;

  return <DevNoticeModal notice={notice} />;
}