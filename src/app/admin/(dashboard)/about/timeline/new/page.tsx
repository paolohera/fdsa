import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createTimelineEntry } from "../actions";
import TimelineForm from "../timeline-form";
 
export default async function NewTimelineEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
 
  return (
    <div>
      <Link
        href="/admin/about/timeline"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to timeline
      </Link>
      <TimelineForm action={createTimelineEntry} error={error} />
    </div>
  );
}
 