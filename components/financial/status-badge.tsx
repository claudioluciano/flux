"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TRANSACTION_STATUS_LABELS,
  TransactionStatus,
} from "@/convex/lib/financialValidators";

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

const STATUS_STYLES: Record<TransactionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  partial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-medium", STATUS_STYLES[status], className)}
    >
      {TRANSACTION_STATUS_LABELS[status]}
    </Badge>
  );
}
