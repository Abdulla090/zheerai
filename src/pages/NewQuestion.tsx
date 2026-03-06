import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { useCreateQuestion } from "@/hooks/useQuestions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "sonner";

const NewQuestion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const createQuestion = useCreateQuestion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("تکایە فایلی وێنە هەڵبژێرە");
      return;
    }

    setCompressing(true);
    try {
      const { blob } = await compressImage(file);
      setImageFile(blob);
      setImagePreview(URL.createObjectURL(blob));
    } catch {
      toast.error("کێشەیەک لە فشردنی وێنە ڕوویدا");
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!title.trim()) { toast.error("بابەتی پرسیار پێویستە"); return; }
    if (!body.trim()) { toast.error("ناوەڕۆکی پرسیار پێویستە"); return; }

    setUploading(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const filePath = `${user.id}/${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(filePath, imageFile, { contentType: "image/webp" });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const data = await createQuestion.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        tags,
        author_id: profile.id,
        image_url: imageUrl,
      } as any);
      toast.success("پرسیارەکە بە سەرکەوتوویی نێردرا!");
      navigate(`/qa/${data.id}`);
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
              <CardTitle className="text-xl">پرسیاری نوێ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="title">بابەتی پرسیار *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="پرسیارەکەت بە کورتی بنووسە..." className="mt-1.5" maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="body">ناوەڕۆک *</Label>
                  <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="پرسیارەکەت بە تەواوی شی بکەرەوە..." className="mt-1.5 min-h-[160px]" maxLength={5000} />
                </div>

                {/* Image Upload */}
                <div>
                  <Label>وێنە (ئارەزوومەندانە)</Label>
                  <div className="mt-1.5">
                    {imagePreview ? (
                      <div className="relative group">
                        <img src={imagePreview} alt="preview" className="w-full max-h-[300px] object-contain rounded-lg border border-border bg-accent/20" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 left-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-accent/30 py-8 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/50"
                      >
                        {compressing ? (
                          <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        ) : (
                          <>
                            <ImagePlus className="h-7 w-7" />
                            <span className="text-sm">وێنە زیادبکە</span>
                            <span className="text-[11px] text-muted-foreground/70">بە فۆرماتی WebP فشرد دەکرێت</span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label>تاگەکان</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="تاگ زیادبکە..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                    <Button type="button" variant="outline" onClick={addTag}>زیادبکە</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>
                          {tag} <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={createQuestion.isPending || uploading}>
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />ناردن...</> : "پرسیارەکە بنێرە"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NewQuestion;
