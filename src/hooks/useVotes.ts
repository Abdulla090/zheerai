import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type VoteType = "upvote" | "downvote";

export const useVotes = (voteableId: string, voteableType: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userVote = null } = useQuery({
    queryKey: ["user_vote", voteableId, voteableType, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("id, vote_type")
        .eq("voteable_id", voteableId)
        .eq("voteable_type", voteableType)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; vote_type: VoteType } | null;
    },
    enabled: !!voteableId && !!user,
  });

  const vote = useMutation({
    mutationFn: async (type: VoteType) => {
      if (!user) throw new Error("Not authenticated");

      if (userVote) {
        if (userVote.vote_type === type) {
          const { error } = await supabase.from("votes").delete().eq("id", userVote.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("votes").update({ vote_type: type }).eq("id", userVote.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from("votes").insert({
          voteable_id: voteableId,
          voteable_type: voteableType,
          user_id: user.id,
          vote_type: type,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_vote", voteableId, voteableType, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["question", voteableId] });
      if (voteableType === "answer") {
        queryClient.invalidateQueries({ queryKey: ["answers"] });
      }
    },
  });

  return { userVote, vote };
};
