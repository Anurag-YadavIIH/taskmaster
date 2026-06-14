import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof Info; classes: string; iconClass: string }> = {
  success: { icon: CheckCircle2, classes: "bg-white border-emerald-200", iconClass: "text-emerald-500" },
  error: { icon: XCircle, classes: "bg-white border-red-200", iconClass: "text-red-500" },
  info: { icon: Info, classes: "bg-white border-indigo-200", iconClass: "text-indigo-500" },
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((toast) => {
          const { icon: Icon, classes, iconClass } = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-xl border ${classes} p-3 shadow-lg shadow-gray-200/50 animate-in`}
              role="status"
            >
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconClass}`} />
              <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
