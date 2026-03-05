import { useParams, Link } from "react-router-dom";
import { Eye, ExternalLink, Github, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/hooks/useProjects";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";

const categories: Record<string, string> = {
  ai_website: "ماڵپەڕی AI",
  ai_mobile_app: "ئەپی مۆبایلی AI",
  ai_tool: "ئامرازی AI",
  ai_solution: "چارەسەری AI",
  other: "هیتر",
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="py-10 md:py-14"><div className="container max-w-3xl space-y-4">
        <Skeleton className="aspect-video w-full" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-24 w-full" />
      </div></div>
    );
  }

  if (!project) {
    return <div className="py-20 text-center text-muted-foreground">پڕۆژەکە نەدۆزرایەوە</div>;
  }

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-3xl">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} className="aspect-video w-full rounded-lg object-cover border border-border mb-6" />
        ) : (
          <div className="aspect-video w-full rounded-lg bg-accent mb-6" />
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="default">{categories[project.category] || project.category}</Badge>
          {project.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{project.title}</h1>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          {project.author_id && (
            <Link to={`/user/${project.author_id}`} className="hover:text-primary transition-colors">
              {project.profiles?.display_name}
            </Link>
          )}
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(project.created_at).toLocaleDateString("ku")}</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{project.views_count}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <LikeButton targetId={project.id} targetType="project" />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />{(project as any).comments_count ?? 0}
          </span>
        </div>

        {(project.demo_url || project.source_url) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.demo_url && (
              <Button asChild variant="default" size="sm">
                <a href={project.demo_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 ml-2" />دیمۆ ببینە</a>
              </Button>
            )}
            {project.source_url && (
              <Button asChild variant="outline" size="sm">
                <a href={project.source_url} target="_blank" rel="noopener noreferrer"><Github className="h-3.5 w-3.5 ml-2" />سۆرس کۆد</a>
              </Button>
            )}
          </div>
        )}

        <Card className="mt-8 border-border">
          <CardContent className="p-6">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{project.description}</p>
          </CardContent>
        </Card>

        <CommentsSection targetId={project.id} targetType="project" />
      </div>
    </div>
  );
};

export default ProjectDetail;
