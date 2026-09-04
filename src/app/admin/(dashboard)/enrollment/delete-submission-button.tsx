"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import ConfirmModal from "@/components/admin/confirm-modal";
import { AdminButton } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";

export default function DeleteSubmissionButton({
  id,
  name,
  deleteAction,
}: {
  id: string;
  name: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const { showToast } = useAdminToast();

  function handleConfirm() {
    setPending(true);
    deleteAction(id)
      .then(() => {
        showToast(`${name}'s application deleted`, "success");
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Failed to delete application", "error");
      })
      .finally(() => setPending(false));
  }

  return (
    <ConfirmModal
      title="Delete application?"
      description={`This permanently deletes ${name}'s application from the database. This can't be undone.`}
      confirmLabel="Delete"
      variant="danger"
      onConfirm={handleConfirm}
      trigger={
        <AdminButton variant="danger" type="button" disabled={pending}>
          {pending && <Loader2 size={15} className="animate-spin" />}
          <Trash2 size={15} />
        </AdminButton>
      }
    />
  );
}