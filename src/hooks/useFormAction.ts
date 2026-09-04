"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/admin-toast";

interface UseFormActionOptions<T> {
  action: (formData: FormData) => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  resetForm?: () => void;
}

export function useFormAction<T = void>({
  action,
  onSuccess,
  onError,
  successMessage = "Saved successfully",
  errorMessage = "Failed to save",
  resetForm,
}: UseFormActionOptions<T>) {
  const router = useRouter();
  const { showToast, updateToast } = useAdminToast();
  const [pending, setPending] = useState(false);

  const submit = useCallback(
    async (formData: FormData) => {
      setPending(true);
      const toastId = showToast("Saving…", "loading");
      try {
        const result = await action(formData);
        updateToast(toastId, successMessage, "success");
        router.refresh();
        onSuccess?.(result);
        resetForm?.();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        updateToast(toastId, message, "error");
        onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setPending(false);
      }
    },
    [action, onSuccess, onError, successMessage, errorMessage, resetForm, showToast, updateToast, router]
  );

  return { submit, pending };
}

interface UseAsyncActionOptions<T> {
  action: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsyncAction<T = void>({
  action,
  onSuccess,
  onError,
  loadingMessage = "Processing…",
  successMessage = "Done",
  errorMessage = "Operation failed",
}: UseAsyncActionOptions<T>) {
  const { showToast, updateToast } = useAdminToast();
  const [pending, setPending] = useState(false);

  const execute = useCallback(async () => {
    setPending(true);
    const toastId = showToast(loadingMessage, "loading");
    try {
      const result = await action();
      updateToast(toastId, successMessage, "success");
      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      updateToast(toastId, message, "error");
      onError?.(err instanceof Error ? err : new Error(message));
      throw err;
    } finally {
      setPending(false);
    }
  }, [action, onSuccess, onError, loadingMessage, successMessage, errorMessage, showToast, updateToast]);

  return { execute, pending };
}