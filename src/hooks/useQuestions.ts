import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Question = Tables<"questions"> & {
  profiles: Pick<Tables<"profiles">, "display_name" | "avatar_url"> | null;
};

export type Answer = Tables<"answers"> & {
  profiles: Pick<Tables<"profiles">, "display_name" | "avatar_url"> | null;
};

export const useQuestions = (sort: "newest" | "votes" | "comments" = "newest") => {
  return useQuery({
    queryKey: ["questions", sort],
    queryFn: async () => {
      let query = supabase
        .from("questions")
        .select("*, profiles(display_name, avatar_url)");

      if (sort === "votes") query = query.order("votes_count", { ascending: false });
      else if (sort === "comments") query = query.order("comments_count", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as Question[];
    },
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Question;
    },
    enabled: !!id,
  });
};

export const useAnswers = (questionId: string) => {
  return useQuery({
    queryKey: ["answers", questionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("answers")
        .select("*, profiles(display_name, avatar_url)")
        .eq("question_id", questionId)
        .order("votes_count", { ascending: false });
      if (error) throw error;
      return data as Answer[];
    },
    enabled: !!questionId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (question: TablesInsert<"questions">) => {
      const { data, error } = await supabase.from("questions").insert(question).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });
};

export const useCreateAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (answer: TablesInsert<"answers">) => {
      const { data, error } = await supabase.from("answers").insert(answer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["answers", variables.question_id] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
};
