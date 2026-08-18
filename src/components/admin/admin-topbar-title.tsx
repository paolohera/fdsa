"use client";

import { usePathname } from "next/navigation";

const SECTION_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/admin/news", label: "News Management" },
  { prefix: "/admin/hero", label: "Hero Carousel" },
  { prefix: "/admin/about", label: "About Image" },
  { prefix: "/admin/messages", label: "Messages" },
  { prefix: "/admin", label: "Dashboard" },
];

export default function AdminTopbarTitle() {
  const pathname = usePathname();
  const section =
    SECTION_LABELS.find((s) => pathname.startsWith(s.prefix))?.label ?? "Dashboard";

  return (
    <h2
      className="mr-8 hidden text-lg font-semibold tracking-tight text-ink lg:block"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {section}
    </h2>
  );
}