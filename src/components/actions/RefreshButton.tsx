import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  "aria-label"?: string;
  title?: string;
  className?: string;
}

const RefreshButton = ({
  onClick,
  disabled = false,
  loading = false,
  label = "重新整理",
  "aria-label": ariaLabel = "重新載入",
  title = "重新載入成員列表",
  className,
}: RefreshButtonProps) => (
  <Button
    type="button"
    variant="outline"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    title={title}
    className={className}
  >
    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
    {label}
  </Button>
);

export default RefreshButton;
