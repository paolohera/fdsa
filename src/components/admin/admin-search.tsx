"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, X, LogIn } from "lucide-react";

type SearchResult = {
  type: "news" | "messages" | "live_chat" | "enrollment" | "timeline";
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const SEARCH_SOURCES = [
  { type: "news" as const, label: "News", path: "/admin/news?q=" },
  { type: "messages" as const, label: "Messages", path: "/admin/messages?q=" },
  { type: "live_chat" as const, label: "Live Chat", path: "/admin/live-chat?q=" },
  { type: "enrollment" as const, label: "Enrollment", path: "/admin/enrollment?q=" },
  { type: "timeline" as const, label: "Timeline", path: "/admin/about/timeline?q=" },
];

export default function AdminSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredSources = useMemo(() => {
    if (!value.trim()) return [];
    return SEARCH_SOURCES.map((s) => ({
      ...s,
      href: `${s.path}${encodeURIComponent(value.trim())}`,
      icon: getSourceIcon(s.type),
    }));
  }, [value]);

  function getSourceIcon(type: SearchResult["type"]) {
    switch (type) {
      case "news":
        return <Newspaper size={14} className="text-brass" />;
      case "messages":
        return <Mail size={14} className="text-blue" />;
      case "live_chat":
        return <MessageCircle size={14} className="text-emerald" />;
      case "enrollment":
        return <ClipboardCheck size={14} className="text-purple" />;
      case "timeline":
        return <Clock size={14} className="text-orange" />;
    }
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const sources = filteredSources;
    if (!sources.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % sources.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + sources.length) % sources.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      router.push(sources[selectedIndex].href);
      setShowResults(false);
      setValue("");
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  }, [filteredSources, router, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
          setShowResults(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [showResults]);

  if (!showResults && !value) {
    return (
      <button
        type="button"
        onClick={() => setShowResults(true)}
        className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg"
      >
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
          />
          <input
            ref={inputRef}
            type="text"
            readOnly
            placeholder="Search news, messages, live chat, enrollment…"
            className="w-full border-b-2 border-ink/15 bg-transparent py-2 pl-9 pr-10 text-sm text-ink placeholder:text-charcoal/40 outline-none transition-colors focus:border-brass cursor-pointer"
          />
        </div>
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 items-center gap-1 px-1.5 text-[10px] font-mono text-charcoal/30 bg-ink/5 rounded">
          <span>⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowResults(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          placeholder="Search news, messages, live chat, enrollment…"
          className="w-full border-b-2 border-ink/15 bg-transparent py-2 pl-9 pr-10 text-sm text-ink placeholder:text-charcoal/40 outline-none transition-colors focus:border-brass"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/60"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showResults && filteredSources.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute left-0 right-0 top-full mt-2 z-50 max-h-60 overflow-y-auto rounded-lg border border-ink/10 bg-paper shadow-xl"
          role="listbox"
        >
          {filteredSources.map((source, index) => (
            <button
              key={source.type}
              type="button"
              onClick={() => {
                router.push(source.href);
                setShowResults(false);
                setValue("");
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition
                ${index === selectedIndex ? "bg-brass/10" : "hover:bg-ink/5"}
              `}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/5">
                {source.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{source.label}</p>
                <p className="truncate text-xs text-charcoal/50">
                  Search for {value}
                </p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-charcoal/40 bg-ink/5 px-1.5 py-0.5 rounded">
                <LogIn size={10} />
                <span>Enter</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {showResults && filteredSources.length === 0 && value && (
        <div
          ref={resultsRef}
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg border border-ink/10 bg-paper shadow-xl p-4 text-center"
        >
          <Search size={24} className="mx-auto mb-2 text-charcoal/20" />
          <p className="text-sm text-charcoal/50">No sections to search</p>
        </div>
      )}
    </div>
  );
}

// Icons needed inline since we can't import from lucide-react in this context easily
function Newspaper({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" />
      <path d="M18 14h-8" />
      <path d="M16 18h-6" />
      <path d="M10 6h8" />
    </svg>
  );
}

function Mail({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MessageCircle({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ClipboardCheck({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect width="8" height="6" x="7" y="7" rx="1" />
      <path d="M9 11l3 3L22 4" />
    </svg>
  );
}

function Clock({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}