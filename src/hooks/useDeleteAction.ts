"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/admin-toast";

interface UseDeleteActionOptions {
  action: () => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmLabel?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function useDeleteAction({
  action,
  onSuccess,
  onError,
  confirmTitle = "Delete this item?",
  confirmDescription = "This action cannot be undone.",
  confirmLabel = "Delete",
  successMessage = "Deleted successfully",
  errorMessage = "Failed to delete",
}: UseDeleteActionOptions) {
  const router = useRouter();
  const { showToast, updateToast } = useAdminToast();

  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const execute = useCallback(async () => {
    if (isOpen) {
      setPending(true);
      const toastId = showToast("Deleting…", "loading");
      try {
        await action();
        updateToast(toastId, successMessage, "success");
        router.refresh();
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        updateToast(toastId, message, "error");
        onError?.(err instanceof Error ? err : new Error(message));
      } finally {
        setPending(false);
        setIsOpen(false);
      }
    } else {
      setIsOpen(true);
    }
  }, [action, onSuccess, onError, isOpen, showToast, updateToast, router, successMessage, errorMessage]);

  const confirm = useCallback(() => {
    setIsOpen(true);
  }, []);

  const cancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    execute,
    confirm,
    cancel,
    isOpen,
    pending,
    confirmTitle,
    confirmDescription,
    confirmLabel,
  };
}