import { cx } from "@/lib/utils";

// Central place mapping every status/priority string used across the app to
// a consistent color so "approved" always looks the same everywhere.
const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  resolved: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  open: "bg-amber-100 text-amber-800",
  changed: "bg-brand-100 text-brand-800",
  rejected: "bg-rose-100 text-rose-800",
  unclear: "bg-ink-100 text-ink-600",
  high: "bg-rose-100 text-rose-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-ink-100 text-ink-600",
};

export function Badge({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  const style = (tone && STATUS_STYLES[tone.toLowerCase()]) || "bg-ink-100 text-ink-700";
  return <span className={cx("badge", style, className)}>{children}</span>;
}
