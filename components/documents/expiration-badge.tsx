import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ExpirationBadgeProps {
  expirationDate?: number;
  className?: string;
}

export function ExpirationBadge({ expirationDate, className }: ExpirationBadgeProps) {
  if (!expirationDate) {
    return (
      <Badge variant="outline" className={className}>
        Sem validade
      </Badge>
    );
  }

  const now = Date.now();
  const daysUntilExpiration = Math.ceil(
    (expirationDate - now) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) {
    return (
      <Badge variant="destructive" className={className}>
        <XCircle className="mr-1 h-3 w-3" />
        Vencido
      </Badge>
    );
  }

  if (daysUntilExpiration <= 30) {
    return (
      <Badge
        variant="outline"
        className={`border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 ${className}`}
      >
        <AlertTriangle className="mr-1 h-3 w-3" />
        Vence em {daysUntilExpiration} {daysUntilExpiration === 1 ? "dia" : "dias"}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 ${className}`}
    >
      <CheckCircle className="mr-1 h-3 w-3" />
      Valido
    </Badge>
  );
}

export function getExpirationStatus(expirationDate?: number): "expired" | "expiring" | "valid" | "none" {
  if (!expirationDate) return "none";

  const now = Date.now();
  const daysUntilExpiration = Math.ceil(
    (expirationDate - now) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) return "expired";
  if (daysUntilExpiration <= 30) return "expiring";
  return "valid";
}
