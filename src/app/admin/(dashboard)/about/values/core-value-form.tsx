"use client";

import { Loader2 } from "lucide-react";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";
import { useFormAction } from "@/hooks/useFormAction";

type CoreValueFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues: {
    letter: string;
    title: string;
    body: string;
    sort_order: number;
  };
};

export default function CoreValueForm({ action, defaultValues }: CoreValueFormProps) {
  const { submit, pending } = useFormAction({
    action,
    successMessage: `Core value ${defaultValues.letter} saved`,
    errorMessage: "Failed to save core value",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <AdminCard className="p-6">
        <span className="text-3xl font-bold text-brass" style={{ fontFamily: "var(--font-display)" }}>
          {defaultValues.letter}
        </span>

        <label className="mt-3 block">
          <span className="text-sm font-medium text-ink">Title</span>
          <input
            name="title"
            type="text"
            required
            defaultValue={defaultValues.title}
            className="mt-1.5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink outline-none focus:border-brass"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-ink">Description</span>
          <textarea
            name="body"
            rows={4}
            required
            defaultValue={defaultValues.body}
            className="mt-1.5 w-full resize-y rounded-md border border-ink/15 px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-brass"
          />
        </label>

        <AdminButton type="submit" disabled={pending} className="mt-5">
          {pending && <Loader2 size={14} className="animate-spin mr-1" />}
          {pending ? "Saving…" : "Save"}
        </AdminButton>
      </AdminCard>
    </form>
  );
}