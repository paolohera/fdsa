"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import ConfirmModal from "@/components/admin/confirm-modal";
import { AdminButton } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";

export default function DeleteCustomCardButton({
  code,
  deleteAction,
}: {
  code: string;
  deleteAction: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

  function handleConfirm() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await deleteAction();
        showToast(`${code} card deleted`, "success");
        resolve();
      });
    });
  }

  return (
    <ConfirmModal
      title={`Delete ${code} card?`}
      description="This removes the card and its image entirely. This can't be undone."
      confirmLabel="Delete"
      variant="danger"
      onConfirm={handleConfirm}
      trigger={
        <AdminButton
          variant="danger"
          type="button"
          disabled={pending}
          className="!w-full !justify-center !gap-2 border border-red-200 !px-3 !py-1.5 !text-xs !text-red-600 hover:!bg-red-50"
        >
          {pending && <Loader2 size={13} className="animate-spin" />}
          {pending ? "Deleting…" : "Delete card"}
        </AdminButton>
      }
    />
  );
}