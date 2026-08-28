"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-ui";
import { useAdminToast } from "@/components/admin/admin-toast";

type Notice = {
  enabled: boolean;
  title: string;
  message: string;
  old_site_url: string | null;
};

export default function DevNoticeForm({
  action,
  notice,
}: {
  action: (formData: FormData) => Promise<void>;
  notice: Notice;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        showToast("Saved — visitors will see the updated notice", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to save", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" name="enabled" defaultChecked={notice.enabled} className="h-4 w-4" />
        Show this notice to visitors
      </label>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Title
        </label>
        <input
          name="title"
          defaultValue={notice.title}
          required
          className="w-full border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Message
        </label>
        <textarea
          name="message"
          defaultValue={notice.message}
          required
          rows={5}
          className="w-full border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/50">
          Old website link (optional)
        </label>
        <input
          name="old_site_url"
          type="url"
          defaultValue={notice.old_site_url ?? ""}
          placeholder="https://your-old-site.com"
          className="w-full border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
        />
      </div>

      <AdminButton type="submit" disabled={pending} className="w-fit gap-2 px-4 py-2 text-xs">
        {pending && <Loader2 size={13} className="animate-spin" />}
        <Save size={13} />
        Save
      </AdminButton>
    </form>
  );
}