import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  video_url: string | null;
  video_type: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string; avatar_url: string | null } | null;
}

export const useTutorials = () => {
  return useQuery({
    queryKey: ["tutorials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutorials" as any)
        .select("*, profiles(display_name, avatar_url)")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Tutorial[];
    },
  });
};
