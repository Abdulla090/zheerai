import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Loader2, ImagePlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { useQuestion } from "@/hooks/useQuestions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "sonner";

const EditQuestion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { data: question, isLoading } = useQuestion(id!);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (question && !initialized) {
      setTitle(question.title);
      setBody(question.body);
      setTags(question.tags || []);
      setImagePreview((question as any).image_url || null);
      setInitialized(true);
    }
  }, [question, initialized]);

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
    setCompressing(true);
    try {
      const { blob } = await compressImage(file);
      setImageBlob(blob);
      setImagePreview(URL.createObjectURL(blob));
    } catch {
      toast.error("کێشەیەک لە فشردنی وێنە ڕوویدا");
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setImageBlob(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !id) return;
    if (!title.trim() || !body.trim()) { toast.error("بابەت و ناوەڕۆک پێویستن"); return; }

    setSaving(true);
    try {
      let imageUrl = imagePreview;

      if (imageBlob) {
        const filePath = `${user.id}/${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await supabase.storage.from("project-images").upload(filePath, imageBlob, { contentType: "image/webp" });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("questions")
        .update({
          title: title.trim(),
          body: body.trim(),
          tags,
          image_url: imageUrl,
        } as any)
        .eq("id", id);

      if (error) throw error;
      toast.success("پرسیارەکە نوێ کرایەوە!");
      navigate(`/qa/${id}`);
    } catch (err: any) {
      toast.error(err.message || "هەڵەیەک ڕوویدا");
    } finally {
      setSaving(false);
    }
  };

  if (!user) { navigate("/login"); return null; }
  if (isLoading) return <div className="py-20 text-center"><Skeleton className="h-8 w-48 mx-auto" /></div>;
  if (!question) return <div className="py-20 text-center text-muted-foreground">پرسیارەکە نەدۆزرایەوە</div>;
  if (question.author_id !== profile?.id) return <div className="py-20 text-center text-muted-foreground">ناتوانیت ئەم پرسیارە دەستکاری بکەیت</div>;

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate(`/qa/${id}`)}>
          <ArrowRight className="h-4 w-4" />گەڕانەوە
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-border">
            <CardHeader><CardTitle className="text-xl">دەستکاری پرسیار</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="title">بابەتی پرسیار *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="body">ناوەڕۆک *</Label>
                  <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="mt-1.5 min-h-[160px]" maxLength={5000} />
                </div>
                <div>
                  <Label>وێنە</Label>
                  <div className="mt-1.5">
                    {imagePreview ? (
                      <div className="relative group">
                        <img src={imagePreview} alt="" className="w-full max-h-[300px] object-contain rounded-lg border border-border bg-accent/20" />
                        <button type="button" onClick={removeImage} className="absolute top-2 left-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-accent/30 py-8 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/50">
                        {compressing ? <Loader2 className="h-7 w-7 animate-spin text-primary" /> : <><ImagePlus className="h-7 w-7" /><span className="text-sm">وێنە زیادبکە</span></>}
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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
                      {tags.map((tag) => (<Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>{tag} <X className="h-3 w-3" /></Badge>))}
                    </div>
                  )}
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

export default EditQuestion;
