import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Eye, ExternalLink, Github, Calendar, MessageSquare, User, Pencil } from "lucide-react";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/hooks/useProjects";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import SEOHead from "@/components/SEOHead";

const categories: Record<string, string> = {
  ai_website: "ماڵپەڕی AI",
  ai_mobile_app: "ئەپی مۆبایلی AI",
  ai_tool: "ئامرازی AI",
  ai_solution: "چارەسەری AI",
  other: "هیتر",
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
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

  // Increment view count once
  useEffect(() => {
    if (id) {
      supabase.rpc("increment_view_count", { table_name: "projects", row_id: id }).then();
    }
  }, [id]);

  const jsonLd = useMemo(() => project ? ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description || "",
    image: project.thumbnail_url || undefined,
    author: { "@type": "Person", name: project.profiles?.display_name },
  }) : undefined, [project]);

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
    <>
      {project && (
        <SEOHead
          title={project.title}
           description={project.description || `پڕۆژەی ${project.title} لە Kurdistan AI`}
           canonical={`https://kurdistanai.app/projects/${project.id}`}
          ogImage={project.thumbnail_url || undefined}
          jsonLd={jsonLd}
        />
      )}
    <div className="py-10 md:py-14">
      <div className="container max-w-3xl">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} className="aspect-video w-full rounded-lg object-cover border border-border mb-6" loading="lazy" decoding="async" />
        ) : (
          <div className="aspect-video w-full rounded-lg bg-accent mb-6" />
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="default">{categories[project.category] || project.category}</Badge>
          {project.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl flex-1">{project.title}</h1>
          {profile && project.author_id === profile.id && (
            <Link to={`/projects/${project.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" />دەستکاری</Button>
            </Link>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {project.author_id && (
            <Link to={`/user/${project.author_id}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-1.5 font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
              {project.profiles?.avatar_url ? (
                <img src={project.profiles.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
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
    </>
  );
};

export default ProjectDetail;
