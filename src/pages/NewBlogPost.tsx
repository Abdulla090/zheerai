import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile, useUserRole } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NewBlogPost = () => {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { data: roles } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = roles?.includes("admin");

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">تکایە پێشتر <a href="/login" className="text-primary underline">بچۆرە ژوورەوە</a></p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !profile) return;

    setSubmitting(true);
    const { error } = await supabase.from("blog_posts").insert({
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      body: body.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      cover_image_url: coverUrl.trim() || null,
      author_id: profile.id,
      published: isAdmin ? true : false,
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "هەڵە", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: isAdmin ? "بابەتەکە بڵاوکرایەوە" : "بابەتەکە نێردرا",
      description: isAdmin ? "بابەتەکەت بڵاوکرایەوە." : "بابەتەکەت بۆ پەسەندکردن نێردرا. کاتێک ئەدمین پەسەندی کرد دەردەکەوێت.",
    });
    navigate("/blog");
  };

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-2">نوسینی بابەتی نوێ</h1>
        {!isAdmin && (
          <p className="text-sm text-muted-foreground mb-6 rounded-md border border-border bg-accent/50 px-4 py-3">
            ئاگاداری: بابەتەکەت پاش نوسین بۆ پەسەندکردنی ئەدمین دەنێردرێت و کاتێک پەسەند بوو بڵاو دەکرێتەوە.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">ناونیشان</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ناونیشانی بابەت" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">پوختە (ئارەزوومەندانە)</Label>
            <Input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="پوختەیەکی کورت" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">لینکی وێنەی سەرەوە (ئارەزوومەندانە)</Label>
            <Input id="cover" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">تاگەکان (بە کۆما جیاکراوە)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI, فێرکاری, ..." />
          </div>

          <div className="space-y-2">
            <Label>ناوەڕۆک (Markdown)</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="write">نوسین</TabsTrigger>
                <TabsTrigger value="preview">پێشبینین</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="بابەتەکەت لێرە بنووسە... (Markdown پشتگیری دەکرێت)"
                  className="min-h-[300px] font-mono text-sm"
                  required
                  dir="auto"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[300px] rounded-md border border-border bg-background p-4 prose prose-sm dark:prose-invert max-w-none" dir="auto">
                  {body ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">هیچ ناوەڕۆکێک نیە بۆ پێشبینین</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button type="submit" disabled={submitting || !title.trim() || !body.trim()}>
            {submitting ? "دەنێردرێت..." : isAdmin ? "بڵاوکردنەوە" : "ناردن بۆ پەسەندکردن"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewBlogPost;
