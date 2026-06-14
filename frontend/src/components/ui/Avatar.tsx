const COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % COLORS.length;
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md";
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const sizeClasses = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-semibold ${colorFor(name)} ${sizeClasses}`}
    >
      {initial}
    </div>
  );
}
