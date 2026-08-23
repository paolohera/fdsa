import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSubmissionStatus } from "../actions";
import { AdminPageHeader, AdminCard, AdminButton, AdminBadge } from "@/components/admin/admin-ui";

const STATUS_TONE: Record<string, "green" | "slate" | "brass"> = {
  new: "brass",
  reviewed: "slate",
  contacted: "green",
};

export default async function EnrollmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("enrollment_submissions")
    .select("id, program_name, program_code, track, data, status, submitted_at")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const { data: fields } = await supabase
    .from("enrollment_fields")
    .select("field_key, label")
    .order("sort_order", { ascending: true });

  const data = submission.data as Record<string, string>;

  return (
    <div>
      <AdminPageHeader
        title={submission.program_name ?? "General Application"}
        description={`Submitted ${new Date(submission.submitted_at).toLocaleString()}`}
        action={<AdminBadge tone={STATUS_TONE[submission.status] ?? "slate"}>{submission.status}</AdminBadge>}
      />

      <AdminCard className="max-w-lg divide-y divide-ink/10">
        {(fields ?? []).map((field) => (
          <div key={field.field_key} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
              {field.label}
            </p>
            <p className="mt-1 text-sm text-ink">{data[field.field_key] || "—"}</p>
          </div>
        ))}
      </AdminCard>

      <div className="mt-6 flex gap-2">
        <form action={updateSubmissionStatus.bind(null, id, "reviewed")}>
          <AdminButton variant="secondary" type="submit">
            Mark Reviewed
          </AdminButton>
        </form>
        <form action={updateSubmissionStatus.bind(null, id, "contacted")}>
          <AdminButton type="submit">Mark Contacted</AdminButton>
        </form>
      </div>
    </div>
  );
}