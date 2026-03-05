import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { useCreateQuestion } from "@/hooks/useQuestions";
import { toast } from "sonner";

const NewQuestion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const createQuestion = useCreateQuestion();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!title.trim()) { toast.error("بابەتی پرسیار پێویستە"); return; }
    if (!body.trim()) { toast.error("ناوەڕۆکی پرسیار پێویستە"); return; }

    try {
      const data = await createQuestion.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        tags,
        author_id: profile.id,
      });
      toast.success("پرسیارەکە بە سەرکەوتوویی نێردرا!");
      navigate(`/qa/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "هەڵەیەک ڕوویدا");
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
                <div>
                  <Label>تاگەکان</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="تاگ زیادبکە..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                    <Button type="button" variant="outline" onClick={addTag}>زیادبکە</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => () => setTags(tags.filter(t => t !== tag))}>
                          {tag} <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={createQuestion.isPending}>
                  {createQuestion.isPending ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />ناردن...</> : "پرسیارەکە بنێرە"}
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
