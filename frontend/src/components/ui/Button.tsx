import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300 shadow-sm",
  secondary: "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:text-gray-400",
  ghost: "text-gray-600 hover:bg-gray-100 disabled:text-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300 shadow-sm",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
