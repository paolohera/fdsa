"use client";

import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/admin/confirm-modal";
import { AdminButton } from "@/components/admin/admin-ui";

export default function DeleteSubmissionButton({
  id,
  name,
  deleteAction,
}: {
  id: string;
  name: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  return (
    <ConfirmModal
      title="Delete application?"
      description={`This permanently deletes ${name}'s application from the database. This can't be undone.`}
      confirmLabel="Delete"
      variant="danger"
      onConfirm={() => deleteAction(id)}
      trigger={
        <AdminButton variant="danger" type="button">
          <Trash2 size={15} />
        </AdminButton>
      }
    />
  );
}