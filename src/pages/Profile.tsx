import { motion } from "framer-motion";
import { User, FolderOpen, MessageCircleQuestion, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { mockProfiles, mockProjects, mockQuestions, mockBlogPosts } from "@/lib/mock-data";

const Profile = () => {
  const profile = mockProfiles[0];
  const userProjects = mockProjects.filter((p) => p.author.id === profile.id);
  const userQuestions = mockQuestions.filter((q) => q.author.id === profile.id);
  const userPosts = mockBlogPosts.filter((b) => b.author.id === profile.id);

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex items-center gap-5"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{profile.display_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="projects" dir="rtl">
          <TabsList className="mb-6">
            <TabsTrigger value="projects" className="gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              پڕۆژەکان
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5">
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              پرسیارەکان
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              بابەتەکان
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            {userProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {userProjects.map((p) => (
                  <Card key={p.id} className="border-border">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">هیچ پڕۆژەیەک نییە</p>
            )}
          </TabsContent>

          <TabsContent value="questions">
            {userQuestions.length > 0 ? (
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

          <TabsContent value="posts">
            {userPosts.length > 0 ? (
              <div className="space-y-3">
                {userPosts.map((b) => (
                  <Card key={b.id} className="border-border">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.excerpt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">هیچ بابەتێک نییە</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
