import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Project } from "@/hooks/useProjects";

const categories = [
  { value: "ai_website", label: "ماڵپەڕی AI" },
  { value: "ai_mobile_app", label: "ئەپی مۆبایلی AI" },
  { value: "ai_tool", label: "ئامرازی AI" },
  { value: "ai_solution", label: "چارەسەری AI" },
  { value: "other", label: "هیتر" },
];

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*, profiles(display_name, avatar_url)").eq("id", id!).single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [demoUrl, setDemoUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (project && !initialized) {
      setTitle(project.title);
      setDescription(project.description || "");
      setCategory(project.category);
      setDemoUrl(project.demo_url || "");
      setSourceUrl(project.source_url || "");
      setTags(project.tags || []);
      setThumbnailPreview(project.thumbnail_url);
      setInitialized(true);
    }
  }, [project, initialized]);

  const addTag = () => { const t = tagInput.trim(); if (t && !tags.includes(t) && tags.length < 10) { setTags([...tags, t]); setTagInput(""); } };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const { blob } = await compressImage(file);
      setThumbnailBlob(blob);
      setThumbnailPreview(URL.createObjectURL(blob));
    } catch { toast.error("کێشەیەک لە فشردنی وێنە ڕوویدا"); }
    finally { setCompressing(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !id) return;
    if (!title.trim()) { toast.error("ناوی پڕۆژە پێویستە"); return; }

    setSaving(true);
    try {
      let thumbnailUrl = thumbnailPreview;

      if (thumbnailBlob) {
        const filePath = `${user.id}/${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await supabase.storage.from("project-images").upload(filePath, thumbnailBlob, { contentType: "image/webp" });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(filePath);
        thumbnailUrl = publicUrl;
      }

      const { error } = await supabase.from("projects").update({
        title: title.trim(),
        description: description.trim() || null,
        category: category as any,
        tags,
        demo_url: demoUrl.trim() || null,
        source_url: sourceUrl.trim() || null,
        thumbnail_url: thumbnailUrl,
      }).eq("id", id);

      if (error) throw error;
      toast.success("پڕۆژەکە نوێ کرایەوە!");
      navigate(`/projects/${id}`);
    } catch (err: any) {
      toast.error(err.message || "هەڵەیەک ڕوویدا");
    } finally {
      setSaving(false);
    }
  };

  if (!user) { navigate("/login"); return null; }
  if (isLoading) return <div className="py-20 text-center"><Skeleton className="h-8 w-48 mx-auto" /></div>;
  if (!project) return <div className="py-20 text-center text-muted-foreground">پڕۆژەکە نەدۆزرایەوە</div>;
  if (project.author_id !== profile?.id) return <div className="py-20 text-center text-muted-foreground">ناتوانیت ئەم پڕۆژەیە دەستکاری بکەیت</div>;

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate(`/projects/${id}`)}>
          <ArrowRight className="h-4 w-4" />گەڕانەوە
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-border">
            <CardHeader><CardTitle className="text-xl">دەستکاری پڕۆژە</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label>وێنەی پڕۆژە</Label>
                  <div className="mt-2">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img src={thumbnailPreview} alt="" className="aspect-video w-full rounded-md object-cover border border-border" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 left-2 h-7 w-7" onClick={() => { setThumbnailBlob(null); setThumbnailPreview(null); }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex aspect-video w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border bg-accent/50 hover:bg-accent transition-colors">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          {compressing ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <><Upload className="h-8 w-8" /><span className="text-sm">وێنە هەڵبژێرە</span></>}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">ناوی پڕۆژە *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" maxLength={150} />
                </div>
                <div>
                  <Label htmlFor="desc">وەسف</Label>
                  <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 min-h-[120px]" maxLength={2000} />
                </div>
                <div>
                  <Label>جۆر</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاگەکان</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="تاگ زیادبکە..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                    <Button type="button" variant="outline" onClick={addTag}>زیادبکە</Button>
                  </div>
                  {tags.length > 0 && (<div className="mt-2 flex flex-wrap gap-1.5">{tags.map((tag) => (<Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>{tag} <X className="h-3 w-3" /></Badge>))}</div>)}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><Label htmlFor="demo">لینکی دیمۆ</Label><Input id="demo" type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className="mt-1.5" /></div>
                  <div><Label htmlFor="source">لینکی سۆرس</Label><Input id="source" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="mt-1.5" /></div>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />پاشەکەوتکردن...</> : "پاشەکەوتکردن"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProject;
