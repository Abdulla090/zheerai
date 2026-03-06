import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Eye, ArrowRight, User, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CommentsSection from "@/components/CommentsSection";
import LikeButton from "@/components/LikeButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlogPost } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile, useUserRole } from "@/hooks/useProfile";
import SEOHead from "@/components/SEOHead";

const BlogPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile } = useCurrentProfile();
  const { data: roles } = useUserRole();
  const isAdmin = roles?.includes("admin");

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog_post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      supabase.rpc("increment_view_count", { table_name: "blog_posts", row_id: id }).then();
    }
  }, [id]);

  const jsonLd = useMemo(() => post ? ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.body?.slice(0, 160),
    image: post.cover_image_url || undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.profiles?.display_name },
  }) : undefined, [post]);

  if (isLoading) {
    return (
      <div className="py-10 md:py-14">
        <div className="container max-w-3xl space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return <div className="py-20 text-center text-muted-foreground">بابەتەکە نەدۆزرایەوە</div>;
  }

  return (
    <>
      {post && (
        <SEOHead
          title={post.title}
          description={post.excerpt || post.body?.slice(0, 160)}
          canonical={`https://zheerai.lovable.app/blog/${post.id}`}
          ogImage={post.cover_image_url || undefined}
          ogType="article"
          jsonLd={jsonLd}
        />
      )}
    <div className="py-10 md:py-14">
      <div className="container max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowRight className="h-4 w-4" />
          گەڕانەوە بۆ بڵاوکراوەکان
        </Link>

        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full aspect-video object-cover rounded-lg mb-6" loading="lazy" decoding="async" />
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex-1">{post.title}</h1>
          {profile && (post.author_id === profile.id || isAdmin) && (
            <Link to={`/blog/${post.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" />دەستکاری</Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
          {post.author_id && (
            <Link to={`/user/${post.author_id}`} className="flex items-center gap-2 rounded-full border border-border bg-accent/50 px-3 py-1.5 hover:bg-accent transition-colors">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="font-medium text-foreground">{post.profiles?.display_name}</span>
            </Link>
          )}
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(post.created_at).toLocaleDateString("ku")}</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.views_count}</span>
        </div>

        <article className="prose prose-sm dark:prose-invert max-w-none mb-10" dir="auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </article>

        <div className="mb-8">
          <LikeButton targetId={post.id} targetType="blog_post" />
        </div>

        <CommentsSection targetId={post.id} targetType="blog_post" />
      </div>
    </div>
    </>
  );
};

export default BlogPostDetail;
