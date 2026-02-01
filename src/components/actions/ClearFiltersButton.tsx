import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ClearFiltersButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const ClearFiltersButton = ({
  onClick,
  disabled = false,
  className,
}: ClearFiltersButtonProps) => (
  <Button
    type="button"
    variant="outline"
    onClick={onClick}
    disabled={disabled}
    aria-label="清除篩選"
    className={className}
  >
    <X className="w-4 h-4 mr-2" />
    清除篩選
  </Button>
);

export default ClearFiltersButton;
