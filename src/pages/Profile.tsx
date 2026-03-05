import { motion } from "framer-motion";
import { User, FolderOpen, MessageCircleQuestion, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile, useUserRole } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: roles } = useUserRole();

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

  if (authLoading) return <div className="py-20 text-center"><Skeleton className="h-8 w-48 mx-auto" /></div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{profileLoading ? <Skeleton className="h-6 w-32" /> : profile?.display_name}</h1>
              {roles?.includes("admin") && <Badge variant="default">ئادمین</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.bio || user.email}</p>
          </div>
        </motion.div>

        <Tabs defaultValue="projects" dir="rtl">
          <TabsList className="mb-6">
            <TabsTrigger value="projects" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" />پڕۆژەکان</TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5"><MessageCircleQuestion className="h-3.5 w-3.5" />پرسیارەکان</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            {userProjects && userProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {userProjects.map((p) => (
                  <Card key={p.id} className="border-border">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.tags?.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card key={q.id} className="border-border">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-foreground">{q.title}</h3>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{q.votes_count} دەنگ</span>
                        <span>{q.answers_count} وەڵام</span>
                      </div>
                    </CardContent>
                  </Card>
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
