import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useVotes } from "@/hooks/useVotes";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  targetId: string;
  targetType: string;
  currentCount: number;
  size?: "sm" | "default";
}

const VoteButtons = ({ targetId, targetType, currentCount, size = "default" }: VoteButtonsProps) => {
  const { user } = useAuth();
  const { userVote, vote } = useVotes(targetId, targetType);

  const handleVote = (type: "upvote" | "downvote") => {
    if (!user) {
      toast.error("دەبێت چوونەژوورەوە بکەیت");
      return;
    }
    vote.mutate(type);
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-accent/60 border border-border/50">
      <button
        onClick={() => handleVote("upvote")}
        disabled={vote.isPending}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          userVote?.vote_type === "upvote"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
      >
        <ArrowBigUp className={cn(iconSize, userVote?.vote_type === "upvote" && "fill-current")} />
      </button>
      <span className={cn(
        "text-sm font-bold min-w-[24px] text-center tabular-nums",
        userVote?.vote_type === "upvote" && "text-primary",
        userVote?.vote_type === "downvote" && "text-destructive",
        !userVote && "text-foreground"
      )}>
        {currentCount}
      </span>
      <button
        onClick={() => handleVote("downvote")}
        disabled={vote.isPending}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          userVote?.vote_type === "downvote"
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
        )}
      >
        <ArrowBigDown className={cn(iconSize, userVote?.vote_type === "downvote" && "fill-current")} />
      </button>
    </div>
  );
};

export default VoteButtons;
