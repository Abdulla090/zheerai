import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { useCreateProject } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  { value: "ai_website", label: "ماڵپەڕی AI" },
  { value: "ai_mobile_app", label: "ئەپی مۆبایلی AI" },
  { value: "ai_tool", label: "ئامرازی AI" },
  { value: "ai_solution", label: "چارەسەری AI" },
  { value: "other", label: "هیتر" },
];

const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const createProject = useCreateProject();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [demoUrl, setDemoUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("قەبارەی وێنە زۆرە (حەدی زۆر ٥ میگابایت)");
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!title.trim()) { toast.error("ناوی پڕۆژە پێویستە"); return; }

    setUploading(true);
    try {
      let thumbnailUrl: string | null = null;

      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("project-images").upload(filePath, thumbnailFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(filePath);
        thumbnailUrl = publicUrl;
      }

      await createProject.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        category: category as any,
        tags,
        demo_url: demoUrl.trim() || null,
        source_url: sourceUrl.trim() || null,
        thumbnail_url: thumbnailUrl,
        author_id: profile.id,
      });

      toast.success("پڕۆژەکە بە سەرکەوتوویی زیادکرا!");
      navigate("/projects");
    } catch (err: any) {
      toast.error(err.message || "هەڵەیەک ڕوویدا");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">پڕۆژەی نوێ زیادبکە</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Thumbnail */}
                <div>
                  <Label>وێنەی پڕۆژە</Label>
                  <div className="mt-2">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img src={thumbnailPreview} alt="preview" className="aspect-video w-full rounded-md object-cover border border-border" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 left-2 h-7 w-7" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex aspect-video w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border bg-accent/50 hover:bg-accent transition-colors">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">وێنە هەڵبژێرە</span>
                          <span className="text-xs">PNG, JPG, WEBP (حەدی زۆر ٥MB)</span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">ناوی پڕۆژە *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ناوی پڕۆژەکەت بنووسە..." className="mt-1.5" maxLength={150} />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="desc">وەسف</Label>
                  <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وەسفی پڕۆژەکەت بنووسە..." className="mt-1.5 min-h-[120px]" maxLength={2000} />
                </div>

                {/* Category */}
                <div>
                  <Label>جۆر</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div>
                  <Label>تاگەکان</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="تاگ زیادبکە..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                    <Button type="button" variant="outline" onClick={addTag}>زیادبکە</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="demo">لینکی دیمۆ</Label>
                    <Input id="demo" type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://..." className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="source">لینکی سۆرس</Label>
                    <Input id="source" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://github.com/..." className="mt-1.5" />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />ناردن...</> : "پڕۆژەکە بنێرە"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NewProject;
