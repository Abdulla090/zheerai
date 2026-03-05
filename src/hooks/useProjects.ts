import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Project = Tables<"projects"> & {
  profiles: Pick<Tables<"profiles">, "display_name" | "avatar_url"> | null;
};

export const useProjects = (category?: string) => {
  return useQuery({
    queryKey: ["projects", category],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select("*, profiles(display_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Project[];
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: TablesInsert<"projects">) => {
      const { data, error } = await supabase.from("projects").insert(project).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};
