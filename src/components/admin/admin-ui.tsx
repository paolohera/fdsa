import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1
          className="text-3xl text-ink sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-6 text-charcoal/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-ink/10 bg-paper transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

const buttonVariants = {
  primary: "bg-ink text-parchment hover:bg-ink/90 focus-visible:ring-brass",
  secondary:
    "border border-ink/20 text-ink hover:bg-ink/5 focus-visible:ring-ink/40",
  danger: "text-red-600 hover:text-red-700 hover:bg-red-50",
  ghost: "text-charcoal/50 hover:text-ink hover:bg-ink/5",
};

export function AdminButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    variant === "danger" || variant === "ghost"
      ? "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium transition focus:outline-none disabled:opacity-40 disabled:pointer-events-none"
      : "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium tracking-[0.01em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:opacity-40 disabled:pointer-events-none";

  return (
    <button className={`${base} ${buttonVariants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function AdminLinkButton({
  children,
  variant = "primary",
  className = "",
  href,
}: {
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  className?: string;
  href: string;
}) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium tracking-[0.01em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment";

  return (
    <a href={href} className={`${base} ${buttonVariants[variant]} ${className}`}>
      {children}
    </a>
  );
}

export function AdminBadge({
  tone = "slate",
  children,
}: {
  tone?: "green" | "slate" | "brass";
  children: ReactNode;
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    slate: "bg-ink/5 text-charcoal/60 ring-ink/10",
    brass: "bg-brass/10 text-brass ring-brass/25",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-ink/20 bg-ink/[0.02] px-6 py-16 text-center">
      <p className="text-sm text-charcoal/50">{children}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-ink/[0.06] ${className}`} />;
}

// Mirrors AdminPageHeader's shape for loading.tsx files — a title bar, a
// description bar, and an optional trailing action button.
export function SkeletonPageHeader({
  titleWidth = "w-48",
  descriptionWidth = "w-64",
  actionWidth,
}: {
  titleWidth?: string;
  descriptionWidth?: string;
  actionWidth?: string;
}) {
  return (
    <div className="mb-10 flex items-start justify-between gap-4">
      <div className="max-w-2xl">
        <Skeleton className={`h-9 ${titleWidth}`} />
        <Skeleton className={`mt-3 h-4 ${descriptionWidth}`} />
      </div>
      {actionWidth && <Skeleton className={`h-10 ${actionWidth}`} />}
    </div>
  );
}

// Mirrors the divide-y list card used by the news/hero admin lists — each
// route supplies its own row shape since thumbnails/actions differ per list.
export function SkeletonListCard({
  rows,
  renderRow,
}: {
  rows: number;
  renderRow: (index: number) => ReactNode;
}) {
  return (
    <AdminCard className="divide-y divide-ink/10">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          {renderRow(i)}
        </div>
      ))}
    </AdminCard>
  );
}
