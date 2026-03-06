import { useEffect, useMemo, useState } from "react";
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

const voteToScore = (vote: "upvote" | "downvote" | null) => {
  if (vote === "upvote") return 1;
  if (vote === "downvote") return -1;
  return 0;
};

const VoteButtons = ({ targetId, targetType, currentCount, size = "default" }: VoteButtonsProps) => {
  const { user } = useAuth();
  const { userVote, vote } = useVotes(targetId, targetType);
  const [optimisticVote, setOptimisticVote] = useState<"upvote" | "downvote" | null>(null);

  useEffect(() => {
    if (!vote.isPending) {
      setOptimisticVote(null);
    }
  }, [vote.isPending, userVote?.vote_type]);

  const activeVote = optimisticVote ?? userVote?.vote_type ?? null;

  const displayCount = useMemo(() => {
    const baseline = voteToScore(userVote?.vote_type ?? null);
    const active = voteToScore(activeVote);
    return currentCount + (active - baseline);
  }, [activeVote, currentCount, userVote?.vote_type]);

  const handleVote = (type: "upvote" | "downvote") => {
    if (!user) {
      toast.error("دەبێت چوونەژوورەوە بکەیت");
      return;
    }

    const nextVote = userVote?.vote_type === type ? null : type;
    setOptimisticVote(nextVote);

    vote.mutate(type, {
      onError: () => setOptimisticVote(null),
    });
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-accent/60 border border-border/50">
      <button
        onClick={() => handleVote("upvote")}
        disabled={vote.isPending}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          activeVote === "upvote"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
      >
        <ArrowBigUp className={cn(iconSize, activeVote === "upvote" && "fill-current")} />
      </button>
      <span
        className={cn(
          "text-sm font-bold min-w-[24px] text-center tabular-nums",
          activeVote === "upvote" && "text-primary",
          activeVote === "downvote" && "text-destructive",
          !activeVote && "text-foreground"
        )}
      >
        {displayCount}
      </span>
      <button
        onClick={() => handleVote("downvote")}
        disabled={vote.isPending}
        className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          activeVote === "downvote"
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
        )}
      >
        <ArrowBigDown className={cn(iconSize, activeVote === "downvote" && "fill-current")} />
      </button>
    </div>
  );
};

export default VoteButtons;
