"use client";

import { useTransition } from "react";
import Link from "next/link";
import { updateSubmissionStatus, deleteSubmission } from "./actions";
import DeleteSubmissionButton from "./delete-submission-button";
import { useAdminToast } from "@/components/admin/admin-toast";

type EnrollmentRowProps = {
  submission: {
    id: string;
    program_name: string | null;
    program_code: string | null;
    data: Record<string, string>;
    status: "new" | "reviewed" | "contacted";
    submitted_at: string;
  };
};

export default function EnrollmentRow({ submission }: EnrollmentRowProps) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

  const data = submission.data as Record<string, string>;
  const displayName = data.full_name || data.name || "Unnamed applicant";

  const handleStatusChange = (newStatus: "new" | "reviewed" | "contacted") => {
    startTransition(async () => {
      try {
        await updateSubmissionStatus(submission.id, newStatus);
        showToast(`Application marked ${newStatus}`, "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to update status", "error");
      }
    });
  };

  return (
    <div key={submission.id} className="flex items-center gap-4 p-4">
      <Link href={`/admin/enrollment/${submission.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink hover:underline">{displayName}</p>
        <p className="mt-0.5 truncate text-xs text-charcoal/50">
          {submission.program_name ?? "General inquiry"}
          {submission.program_code ? ` (${submission.program_code})` : ""}
        </p>
      </Link>
      <select
        value={submission.status}
        onChange={(e) => handleStatusChange(e.target.value as "new" | "reviewed" | "contacted")}
        disabled={pending}
        className="w-28 rounded-md border border-ink/15 px-2 py-1.5 text-sm text-ink outline-none focus:border-brass bg-paper"
      >
        <option value="new">New</option>
        <option value="reviewed">Reviewed</option>
        <option value="contacted">Contacted</option>
      </select>
      <span className="w-24 shrink-0 text-right text-xs text-charcoal/40">
        {new Date(submission.submitted_at).toLocaleDateString()}
      </span>
      <DeleteSubmissionButton id={submission.id} name={displayName} deleteAction={deleteSubmission} />
    </div>
  );
}