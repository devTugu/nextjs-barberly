import { X } from "lucide-react";
import { SUPER_ADMIN_ROLE } from "@/shared/config/permissions";
import { Badge } from "@/shared/ui/badge";

interface UserRoleBadgeProps {
  name: string;
  onRemove?: () => void;
  canRemove: boolean;
  removeAriaLabel: string;
}

export function UserRoleBadge({
  name,
  onRemove,
  canRemove,
  removeAriaLabel,
}: UserRoleBadgeProps) {
  return (
    <Badge
      variant={name === SUPER_ADMIN_ROLE ? "default" : "secondary"}
      className="gap-1 pr-1"
    >
      {name}
      {canRemove && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm p-0.5 hover:bg-background/20"
          aria-label={removeAriaLabel}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </Badge>
  );
}
