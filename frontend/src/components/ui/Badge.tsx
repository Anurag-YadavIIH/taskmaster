import type { TaskPriority, TaskStatus } from "../../lib/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  OPEN: "bg-slate-100 text-slate-700 ring-slate-600/15",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-600/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-gray-100 text-gray-500 ring-gray-500/15",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "bg-gray-100 text-gray-600 ring-gray-500/15",
  MEDIUM: "bg-sky-50 text-sky-700 ring-sky-600/20",
  HIGH: "bg-amber-50 text-amber-700 ring-amber-600/20",
  URGENT: "bg-red-50 text-red-700 ring-red-600/20",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
