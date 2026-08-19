import Link from "next/link";
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteTimelineEntry, moveTimelineEntry } from "./actions";
import {
  AdminPageHeader,
  AdminCard,
  AdminLinkButton,
  AdminButton,
  AdminEmptyState,
} from "@/components/admin/admin-ui";

export default async function TimelinePage() {
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from("timeline_entries")
    .select("id, year, title, body, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <AdminPageHeader
        title="History & Heritage timeline"
        description="Entries shown on the About page, in order."
        action={
          <AdminLinkButton href="/admin/about/timeline/new">
            <Plus size={16} /> New entry
          </AdminLinkButton>
        }
      />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {entries?.length === 0 ? (
        <AdminEmptyState>No timeline entries yet.</AdminEmptyState>
      ) : (
        <AdminCard className="divide-y divide-ink/10">
          {entries?.map((entry, i) => (
            <div key={entry.id} className="flex items-start gap-4 p-4">
              <div className="flex flex-col items-center gap-1 pt-1">
                <form action={moveTimelineEntry.bind(null, entry.id, "up")}>
                  <AdminButton
                    variant="secondary"
                    type="submit"
                    disabled={i === 0}
                    className="!p-1"
                  >
                    <ChevronUp size={14} />
                  </AdminButton>
                </form>
                <form action={moveTimelineEntry.bind(null, entry.id, "down")}>
                  <AdminButton
                    variant="secondary"
                    type="submit"
                    disabled={i === (entries?.length ?? 1) - 1}
                    className="!p-1"
                  >
                    <ChevronDown size={14} />
                  </AdminButton>
                </form>
              </div>

              <div className="flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-brass">
                  {entry.year}
                </span>
                <p className="text-sm font-medium text-ink">{entry.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-charcoal/60">{entry.body}</p>
              </div>

              <Link href={`/admin/about/timeline/${entry.id}`}>
                <AdminButton variant="secondary">
                  <Pencil size={15} />
                </AdminButton>
              </Link>

              <form action={deleteTimelineEntry.bind(null, entry.id)}>
                <AdminButton variant="danger">
                  <Trash2 size={15} />
                </AdminButton>
              </form>
            </div>
          ))}
        </AdminCard>
      )}
    </div>
  );
}