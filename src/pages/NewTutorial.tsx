import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile, useUserRole } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Loader2 } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { compressImage } from "@/lib/imageCompression";

const NewTutorial = () => {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { data: roles } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = roles?.includes("admin");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("none");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user || !isAdmin) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">تەنها ئەدمین دەتوانێت فێرکاری زیاد بکات</p>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setCompressing(true);
    try {
      const { blob } = await compressImage(file);
      setUploading(true);
      setCompressing(false);
      const fileName = `${user.id}/${Date.now()}.webp`;
      const { error } = await supabase.storage.from("blog-covers").upload(fileName, blob, { contentType: "image/webp" });
      if (error) { toast({ title: "هەڵە", description: error.message, variant: "destructive" }); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from("blog-covers").getPublicUrl(fileName);
      setThumbnailUrl(urlData.publicUrl);
      setThumbnailPreview(urlData.publicUrl);
    } catch {
      toast({ title: "هەڵە", description: "کێشەیەک لە فشردنی وێنە ڕوویدا", variant: "destructive" });
    } finally {
      setUploading(false);
      setCompressing(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnailUrl("");
    setThumbnailPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !profile) return;

    setSubmitting(true);
    const { error } = await supabase.from("tutorials" as any).insert({
      title: title.trim(),
      description: description.trim() || null,
      body: body.trim() || null,
      video_url: videoUrl.trim() || null,
      video_type: videoType,
      thumbnail_url: thumbnailUrl.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      author_id: profile.id,
      published: true,
    } as any);

    setSubmitting(false);
    if (error) { toast({ title: "هەڵە", description: error.message, variant: "destructive" }); return; }
    toast({ title: "فێرکارییەکە زیادکرا ✓" });
    navigate("/tutorials");
  };

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">فێرکاری نوێ</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">ناونیشان *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ناونیشانی فێرکاری" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وەسف</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وەسفێکی کورت" />
          </div>

          {/* Video section */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Label className="text-base font-semibold">ڤیدیۆ</Label>
            <div className="space-y-2">
              <Label htmlFor="videoType">جۆری ڤیدیۆ</Label>
              <Select value={videoType} onValueChange={setVideoType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بێ ڤیدیۆ</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="google_drive">Google Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {videoType !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">لینکی ڤیدیۆ</Label>
                <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder={videoType === "youtube" ? "https://youtube.com/watch?v=..." : "https://drive.google.com/file/d/..."} dir="ltr" />
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>وێنەی سەرەوە</Label>
            {thumbnailPreview ? (
              <div className="relative group">
                <img src={thumbnailPreview} alt="" className="w-full aspect-video object-cover rounded-lg border border-border" />
                <button type="button" onClick={removeThumbnail} className="absolute top-2 left-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-accent/30 py-10 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/50">
                {compressing || uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <><ImagePlus className="h-8 w-8" /><span className="text-sm">وێنە هەڵبژێرە</span></>}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">تاگەکان (بە کۆما جیاکراوە)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI, فێرکاری, ..." />
          </div>

          {/* Body markdown */}
          <div className="space-y-2">
            <Label>ناوەڕۆک (Markdown)</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="write">نوسین</TabsTrigger>
                <TabsTrigger value="preview">پێشبینین</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="ناوەڕۆکی فێرکاری لێرە بنووسە..." className="min-h-[300px] font-mono text-sm" dir="auto" />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[300px] rounded-md border border-border bg-background p-4 prose prose-sm dark:prose-invert max-w-none" dir="auto">
                  {body ? <MarkdownRenderer content={body} /> : <p className="text-muted-foreground">هیچ ناوەڕۆکێک نیە</p>}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? "زیادکردن..." : "بڵاوکردنەوە"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewTutorial;
