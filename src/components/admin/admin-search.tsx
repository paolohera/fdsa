"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function AdminSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        router.push(`/admin/news?q=${encodeURIComponent(value.trim())}`);
      }}
      className="relative w-full max-w-xs"
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search news posts…"
        className="w-full border-b-2 border-ink/15 bg-transparent py-2 pl-9 pr-3 text-sm text-ink placeholder:text-charcoal/40 outline-none transition-colors focus:border-brass"
      />
    </form>
  );
}
