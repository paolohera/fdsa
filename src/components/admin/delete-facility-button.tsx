"use client";

import { useState } from "react";
import { useAdminToast } from "@/components/admin/admin-toast";
import { deleteFacility } from "@/lib/facilities/actions";

interface DeleteFacilityButtonProps {
  facilityId: string;
  facilityTitle: string;
}

export function DeleteFacilityButton({ facilityId, facilityTitle }: { facilityId: string; facilityTitle: string }) {
  const { showToast } = useAdminToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${facilityTitle}"? This will also delete all gallery images.`)) {
      return;
    }

    try {
      await deleteFacility(facilityId);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete facility");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-600/30 rounded-lg transition hover:bg-red-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
      Delete
    </button>
  );
}