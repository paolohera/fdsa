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
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
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
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

const buttonVariants = {
  primary:
    "bg-ink text-white hover:bg-ink/90 focus-visible:ring-ink",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
  danger: "text-red-500 hover:text-red-600 hover:bg-red-50",
  ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
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
      ? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition focus:outline-none"
      : "inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

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
    "inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

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
    slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
    brass: "bg-amber-50 text-amber-700 ring-amber-600/20",
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-16 text-center">
      <p className="text-sm text-slate-500">{children}</p>
    </div>
  );
}