import { Link, useNavigate } from "react-router-dom";
import { User, FolderOpen, MessageCircleQuestion, Crown, Shield, Calendar, Heart, MessageSquare, Eye, Settings, Mail, FileText, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile, useUserRole } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: roles } = useUserRole();

  const isAdmin = roles?.includes("admin");

  const { data: userProjects } = useQuery({
    queryKey: ["user_projects", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("author_id", profile!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const { data: userQuestions } = useQuery({
    queryKey: ["user_questions", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("questions").select("*").eq("author_id", profile!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const { data: userBlogs } = useQuery({
    queryKey: ["user_blogs", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("author_id", profile!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const { data: stats } = useQuery({
    queryKey: ["user_stats", profile?.id],
    queryFn: async () => {
      const [projectsRes, questionsRes, blogsRes, commentsRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("author_id", profile!.id),
        supabase.from("questions").select("id", { count: "exact", head: true }).eq("author_id", profile!.id),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("author_id", profile!.id),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", profile!.id),
      ]);
      return {
        projects: projectsRes.count ?? 0,
        questions: questionsRes.count ?? 0,
        blogs: blogsRes.count ?? 0,
        comments: commentsRes.count ?? 0,
      };
    },
    enabled: !!profile,
  });

  if (authLoading) return <div className="py-20 text-center"><Skeleton className="h-8 w-48 mx-auto" /></div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-4xl">
        {/* Profile Header */}
        <div className={`relative mb-8 rounded-2xl border p-6 md:p-8 ${isAdmin ? "border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5" : "border-border bg-card"}`}>
          {isAdmin && (
            <div className="absolute top-4 left-4">
              <Crown className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${isAdmin ? "bg-primary/10 ring-2 ring-primary/20" : "bg-accent"}`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <User className={`h-8 w-8 ${isAdmin ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </div>

            <div className="flex-1 text-center sm:text-right">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {profileLoading ? (
                  <Skeleton className="h-7 w-36" />
                ) : (
                  <h1 className="text-xl font-bold text-foreground">{profile?.display_name}</h1>
                )}
                {isAdmin && (
                  <Badge className="gap-1 border-primary/30 bg-primary/10 text-primary hover:bg-primary/15">
                    <Shield className="h-3 w-3" />
                    ئادمین
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{profile?.bio || "هێشتا بایۆیەک نەنووسراوە"}</p>
              <div className="mt-2 flex gap-2">
                <Link to="/profile/edit">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Settings className="h-3 w-3" />
                    دەستکاریکردنی پرۆفایل
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={async () => {
                    await signOut();
                    navigate("/login");
                  }}
                >
                  <LogOut className="h-3 w-3" />
                  چوونەدەرەوە
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />ئەندام لە {new Date(profile?.created_at ?? user.created_at).toLocaleDateString("ku")}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "پڕۆژە", value: stats?.projects ?? 0, icon: FolderOpen },
              { label: "پرسیار", value: stats?.questions ?? 0, icon: MessageCircleQuestion },
              { label: "بابەت", value: stats?.blogs ?? 0, icon: FileText },
              { label: "لێدوان", value: stats?.comments ?? 0, icon: MessageSquare },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-3">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">{s.value}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="projects" dir="rtl">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="projects" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" />پڕۆژەکان</TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5"><MessageCircleQuestion className="h-3.5 w-3.5" />پرسیارەکان</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            {userProjects && userProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {userProjects.map((p) => (
                  <Link key={p.id} to={`/projects/${p.id}`}>
                    <Card className="border-border transition-shadow hover:shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {p.tags?.slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{p.views_count}</span>
                            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{(p as any).likes_count ?? 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">هیچ پڕۆژەیەک نییە</p>
            )}
          </TabsContent>

          <TabsContent value="questions">
            {userQuestions && userQuestions.length > 0 ? (
              <div className="space-y-3">
                {userQuestions.map((q) => (
                  <Link key={q.id} to={`/qa/${q.id}`}>
                    <Card className="border-border transition-shadow hover:shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-foreground">{q.title}</h3>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>{q.votes_count} دەنگ</span>
                          <span>{q.answers_count} وەڵام</span>
                          <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{(q as any).likes_count ?? 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">هیچ پرسیارێک نییە</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
