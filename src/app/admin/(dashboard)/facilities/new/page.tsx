"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FacilityForm } from "@/components/admin/facility-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export default function NewFacilityPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add Facility"
        description="Create a new facility with gallery images in one step"
      />

      <FacilityForm
        onSuccess={() => {}}
      />
    </div>
  );
}