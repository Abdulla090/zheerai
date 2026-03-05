import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Comment = Tables<"comments"> & {
  profiles: Pick<Tables<"profiles">, "display_name" | "avatar_url"> | null;
};

export const useComments = (targetId: string, targetType: string) => {
  return useQuery({
    queryKey: ["comments", targetId, targetType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(display_name, avatar_url)")
        .eq("target_id", targetId)
        .eq("target_type", targetType)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!targetId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: { content: string; author_id: string; target_id: string; target_type: string }) => {
      const { data, error } = await supabase.from("comments").insert(comment).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.target_id, variables.target_type] });
    },
  });
};
