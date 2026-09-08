"use client";

import { LogOut } from "lucide-react";
import ConfirmModal from "@/components/admin/confirm-modal";

export default function AdminLogoutButton({ logoutAction }: { logoutAction: () => Promise<void> }) {
  return (
    <ConfirmModal
      title="Sign out?"
      description="You'll need to sign in again to access the admin panel."
      confirmLabel="Sign out"
      variant="danger"
      onConfirm={logoutAction}
      trigger={
        <button
          type="button"
          aria-label="Sign out"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal/60 transition hover:bg-ink/5 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <LogOut size={18} strokeWidth={2} />
        </button>
      }
    />
  );
}