import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useLikes = (targetId: string, targetType: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likesCount = 0 } = useQuery({
    queryKey: ["likes_count", targetId, targetType],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("target_id", targetId)
        .eq("target_type", targetType);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!targetId,
  });

  const { data: hasLiked = false } = useQuery({
    queryKey: ["has_liked", targetId, targetType, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("target_id", targetId)
        .eq("target_type", targetType)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!targetId && !!user,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (hasLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("target_id", targetId)
          .eq("target_type", targetType)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ target_id: targetId, target_type: targetType, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes_count", targetId, targetType] });
      queryClient.invalidateQueries({ queryKey: ["has_liked", targetId, targetType, user?.id] });
    },
  });

  return { likesCount, hasLiked, toggleLike };
};
