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
          className="p-1.5 text-parchment/50 transition hover:text-parchment"
        >
          <LogOut size={17} strokeWidth={2} />
        </button>
      }
    />
  );
}