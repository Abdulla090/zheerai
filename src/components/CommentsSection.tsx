import { useState } from "react";
import { MessageSquare, Send, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommentsSectionProps {
  targetId: string;
  targetType: string;
}

const CommentsSection = ({ targetId, targetType }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { data: comments, isLoading } = useComments(targetId, targetType);
  const createComment = useCreateComment();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!body.trim()) { toast.error("ناوەڕۆکی لێدوان پێویستە"); return; }
    try {
      await createComment.mutateAsync({
        content: body.trim(),
        author_id: profile.id,
        target_id: targetId,
        target_type: targetType,
      });
      setBody("");
      toast.success("لێدوانەکەت نێردرا!");
    } catch {
      toast.error("هەڵەیەک ڕوویدا");
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) { toast.error("نەتوانرا بسڕدرێتەوە"); return; }
    queryClient.invalidateQueries({ queryKey: ["comments", targetId, targetType] });
    toast.success("لێدوانەکە سڕایەوە");
  };

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
        <MessageSquare className="h-4 w-4" />
        لێدوانەکان ({comments?.length ?? 0})
      </h3>

      {comments && comments.length > 0 && (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent overflow-hidden">
                {c.profiles?.avatar_url ? (
                  <img src={c.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{c.profiles?.display_name}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString("ku")}</span>
                  </div>
                  {user && profile && c.author_id === profile.id && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="لێدوانێک بنووسە..."
            className="min-h-[60px] flex-1"
            maxLength={2000}
          />
          <Button type="submit" size="sm" disabled={createComment.isPending} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <p className="text-center text-xs text-muted-foreground py-4">
          بۆ لێدواندان دەبێت <a href="/login" className="text-primary hover:underline">بچیتەژوورەوە</a>
        </p>
      )}
    </div>
  );
};

export default CommentsSection;
