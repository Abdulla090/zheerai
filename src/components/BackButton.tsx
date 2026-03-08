import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface BackButtonProps {
  fallback?: string;
  label?: string;
}

const BackButton = ({ fallback = "/", label = "گەڕانەوە" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 -mt-2 active:scale-95 touch-manipulation"
      aria-label={label}
    >
      <ArrowRight className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
