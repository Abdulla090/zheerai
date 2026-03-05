import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Calendar } from "lucide-react";
import type { BlogPost } from "@/hooks/useBlogPosts";

const AdminBlogApproval = () => {
  const { user } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = roles?.includes("admin");

  const { data: pending, isLoading } = useQuery({
    queryKey: ["pending_blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, profiles(display_name, avatar_url)")
        .eq("published", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("blog_posts").update({ published: true }).eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending_blog_posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
      toast({ title: "پەسەند کرا", description: "بابەتەکە بڵاوکرایەوە." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending_blog_posts"] });
      toast({ title: "ڕەتکرایەوە", description: "بابەتەکە سڕایەوە." });
    },
  });

  if (!user || rolesLoading) return null;
  if (!isAdmin) {
    return <div className="py-20 text-center text-muted-foreground">تەنها ئەدمین دەستگەیشتنی هەیە.</div>;
  }

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-2">پەسەندکردنی بابەتەکان</h1>
        <p className="text-sm text-muted-foreground mb-8">بابەتەکانی چاوەڕوانی پەسەندکردن</p>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        )}

        {!isLoading && (!pending || pending.length === 0) && (
          <div className="py-16 text-center text-sm text-muted-foreground">هیچ بابەتێکی چاوەڕوان نیە</div>
        )}

        <div className="space-y-4">
          {pending?.map((post) => (
            <Card key={post.id} className="border-border">
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{post.title}</h3>
                {post.excerpt && <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span>{post.profiles?.display_name}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.created_at).toLocaleDateString("ku")}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveMutation.mutate(post.id)} disabled={approveMutation.isPending}>
                    <Check className="h-4 w-4 ml-1" />
                    پەسەندکردن
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(post.id)} disabled={deleteMutation.isPending}>
                    <X className="h-4 w-4 ml-1" />
                    ڕەتکردنەوە
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogApproval;
