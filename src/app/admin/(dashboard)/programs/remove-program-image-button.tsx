"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import ConfirmModal from "@/components/admin/confirm-modal";
import { AdminButton } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";

export default function RemoveProgramImageButton({
  code,
  removeAction,
}: {
  code: string;
  removeAction: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

  function handleConfirm() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await removeAction();
        showToast(`${code} image removed`, "success");
        resolve();
      });
    });
  }

  return (
    <ConfirmModal
      title={`Remove ${code} image?`}
      description={`This deletes the current photo for ${code} from storage. You can upload a new one anytime.`}
      confirmLabel="Remove"
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
          {pending ? "Removing…" : "Remove"}
        </AdminButton>
      }
    />
  );
}