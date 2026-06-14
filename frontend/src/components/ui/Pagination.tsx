import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  page: number; // zero-based current page
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalElements === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-1 pt-4">
      <p className="text-sm text-gray-500">
        Page <span className="font-medium text-gray-700">{page + 1}</span> of{" "}
        <span className="font-medium text-gray-700">{Math.max(totalPages, 1)}</span> &middot;{" "}
        <span className="font-medium text-gray-700">{totalElements}</span> total
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<ChevronLeft className="h-4 w-4" />}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
