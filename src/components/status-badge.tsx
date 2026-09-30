import { cn } from "@/lib/utils";
import { STATUS_LABELS, type ServiceOrderStatus } from "@/lib/domain";

const tones: Record<ServiceOrderStatus, string> = {
  RECEIVED: "bg-ink/8 text-ink",
  DIAGNOSING: "bg-accent/10 text-accent-2",
  WAITING_APPROVAL: "bg-warn/15 text-warn",
  IN_REPAIR: "bg-accent/15 text-accent-2",
  READY: "bg-ok/15 text-ok",
  DELIVERED: "bg-muted/20 text-muted",
  CANCELLED: "bg-danger/12 text-danger",
};

export function StatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
