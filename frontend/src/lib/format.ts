/** Formats a LocalDate string ("YYYY-MM-DD") or ISO timestamp as a short date. */
export function formatDate(dateStr: string): string {
  const date = dateStr.length === 10 ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Formats an ISO timestamp as a short date and time. */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Formats a byte count as a human-readable size, e.g. "1.5 MB". */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

/** Formats an ISO timestamp as a relative time, e.g. "3 minutes ago". */
export function formatRelativeTime(dateStr: string): string {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  return rtf.format(diffDay, "day");
}
