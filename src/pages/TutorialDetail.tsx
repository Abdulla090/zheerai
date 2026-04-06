import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";
import SEOHead from "@/components/SEOHead";
import type { Tutorial } from "@/hooks/useTutorials";
import { useEffect } from "react";

const TutorialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tutorial, isLoading } = useQuery({
    queryKey: ["tutorial", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutorials" as any)
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as Tutorial;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      supabase.rpc("increment_view_count", { table_name: "tutorials", row_id: id });
    }
  }, [id]);

  const getEmbedUrl = (url: string | null, type: string | null) => {
    if (!url) return null;
    if (type === "youtube") {
      const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([\w-]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (type === "google_drive") {
      const match = url.match(/\/d\/([\w-]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return null;
  };

  if (isLoading) return <div className="py-20 text-center"><Skeleton className="h-8 w-64 mx-auto" /></div>;
  if (!tutorial) return <div className="py-20 text-center text-muted-foreground">فێرکارییەکە نەدۆزرایەوە</div>;

  const embedUrl = getEmbedUrl(tutorial.video_url, tutorial.video_type);

  return (
    <>
      <SEOHead
        title={`${tutorial.title} | Kurdistan AI`}
        description={tutorial.description || tutorial.title}
      />
      <div className="py-10 md:py-14">
        <div className="container max-w-4xl">
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate("/tutorials")}>
            <ArrowRight className="h-4 w-4" />فێرکارییەکان
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{tutorial.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
            {tutorial.profiles && <span>{tutorial.profiles.display_name}</span>}
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDistanceToNow(new Date(tutorial.created_at), { locale: ar, addSuffix: true })}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{tutorial.views_count}</span>
          </div>

          {tutorial.tags && tutorial.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tutorial.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
            </div>
          )}

          {/* Video embed */}
          {embedUrl && (
            <div className="aspect-video rounded-xl overflow-hidden border border-border mb-8 bg-black">
              <iframe
                src={embedUrl}
                title={tutorial.title}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* Markdown body */}
          {tutorial.body && (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-8" dir="auto">
              <MarkdownRenderer content={tutorial.body} />
            </div>
          )}

          {/* Like */}
          <div className="flex items-center gap-4 border-t border-b border-border py-4 mb-8">
            <LikeButton targetId={tutorial.id} targetType="tutorial" />
          </div>

          {/* Comments */}
          <CommentsSection targetId={tutorial.id} targetType="tutorial" />
        </div>
      </div>
    </>
  );
};

export default TutorialDetail;
