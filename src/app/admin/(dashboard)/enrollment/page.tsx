import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteSubmission } from "./actions";
import DeleteSubmissionButton from "./delete-submission-button";
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminEmptyState,
} from "@/components/admin/admin-ui";

const STATUS_TONE: Record<string, "green" | "slate" | "brass"> = {
  new: "brass",
  reviewed: "slate",
  contacted: "green",
};

export default async function EnrollmentListPage() {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("enrollment_submissions")
    .select("id, program_name, program_code, data, status, submitted_at")
    .order("submitted_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title="Enrollment applications"
        description="Applications submitted through the Enroll Now forms."
        action={
          <Link
            href="/admin/enrollment/fields"
            className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-ink/5"
          >
            Edit form fields
          </Link>
        }
      />

      {(!submissions || submissions.length === 0) ? (
        <AdminEmptyState>No applications yet.</AdminEmptyState>
      ) : (
        <AdminCard className="divide-y divide-ink/10">
          {submissions.map((s) => {
            const data = s.data as Record<string, string>;
            const displayName = data.full_name || data.name || "Unnamed applicant";
            return (
              <div key={s.id} className="flex items-center gap-4 p-4">
                <Link href={`/admin/enrollment/${s.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink hover:underline">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs text-charcoal/50">
                    {s.program_name ?? "General inquiry"}
                    {s.program_code ? ` (${s.program_code})` : ""}
                  </p>
                </Link>
                <AdminBadge tone={STATUS_TONE[s.status] ?? "slate"}>{s.status}</AdminBadge>
                <span className="w-24 shrink-0 text-right text-xs text-charcoal/40">
                  {new Date(s.submitted_at).toLocaleDateString()}
                </span>
                <DeleteSubmissionButton id={s.id} name={displayName} deleteAction={deleteSubmission} />
              </div>
            );
          })}
        </AdminCard>
      )}
    </div>
  );
}