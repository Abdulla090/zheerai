import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Comment = Tables<"comments"> & {
  profiles: Pick<Tables<"profiles">, "display_name" | "avatar_url"> | null;
  parent_id: string | null;
  replies?: Comment[];
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

      const all = data as Comment[];
      const topLevel: Comment[] = [];
      const byParent: Record<string, Comment[]> = {};

      for (const c of all) {
        if (c.parent_id) {
          if (!byParent[c.parent_id]) byParent[c.parent_id] = [];
          byParent[c.parent_id].push(c);
        } else {
          topLevel.push(c);
        }
      }

      for (const c of topLevel) {
        c.replies = byParent[c.id] || [];
      }

      return topLevel;
    },
    enabled: !!targetId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: { content: string; author_id: string; target_id: string; target_type: string; parent_id?: string | null }) => {
      const { data, error } = await supabase.from("comments").insert({
        content: comment.content,
        author_id: comment.author_id,
        target_id: comment.target_id,
        target_type: comment.target_type,
        ...(comment.parent_id ? { parent_id: comment.parent_id } : {}),
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.target_id, variables.target_type] });
    },
  });
};
