import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TimelineForm from "../timeline-form";
import { updateTimelineEntry } from "../actions";

export default async function EditTimelineEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("timeline_entries")
    .select("year, title, body, image_url")
    .eq("id", id)
    .single();

  if (!entry) notFound();

  const updateEntryWithId = updateTimelineEntry.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/about/timeline"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to timeline
      </Link>
      <TimelineForm action={updateEntryWithId} defaultValues={entry} error={error} />
    </div>
  );
}