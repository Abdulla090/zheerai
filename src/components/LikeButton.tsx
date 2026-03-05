import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  targetId: string;
  targetType: string;
  size?: "sm" | "default";
}

const LikeButton = ({ targetId, targetType, size = "sm" }: LikeButtonProps) => {
  const { user } = useAuth();
  const { likesCount, hasLiked, toggleLike } = useLikes(targetId, targetType);

  const handleClick = () => {
    if (!user) {
      toast.error("دەبێت چوونەژوورەوە بکەیت");
      return;
    }
    toggleLike.mutate();
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={toggleLike.isPending}
      className={cn(
        "gap-1.5 text-muted-foreground hover:text-destructive",
        hasLiked && "text-destructive"
      )}
    >
      <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
      <span className="text-xs">{likesCount}</span>
    </Button>
  );
};

export default LikeButton;
