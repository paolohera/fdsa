import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminCard, AdminBadge, AdminEmptyState } from "@/components/admin/admin-ui";
import EnrollmentRow from "./enrollment-row";

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
          {submissions.map((s) => (
            <EnrollmentRow key={s.id} submission={s} />
          ))}
        </AdminCard>
      )}
    </div>
  );
}