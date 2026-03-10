import { useState } from "react";
import { MessageSquare, Send, Trash2, User, Reply, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useComments, useCreateComment, type Comment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile, useUserRole } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommentsSectionProps {
  targetId: string;
  targetType: string;
}

const CommentItem = ({
  comment,
  user,
  profileId,
  onDelete,
  onReply,
  isReply = false,
  isAdmin = false,
}: {
  comment: Comment;
  user: any;
  profileId?: string;
  onDelete: (id: string) => void;
  onReply: (comment: Comment) => void;
  isReply?: boolean;
  isAdmin?: boolean;
}) => (
  <div className={`flex gap-3 rounded-lg border border-border bg-card p-3 ${isReply ? "mr-8 border-muted bg-muted/30" : ""}`}>
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent overflow-hidden">
      {comment.profiles?.avatar_url ? (
        <img src={comment.profiles.avatar_url} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <User className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{comment.profiles?.display_name}</span>
          <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString("ku")}</span>
        </div>
        <div className="flex items-center gap-1">
          {user && !isReply && (
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-primary gap-1" onClick={() => onReply(comment)}>
              <Reply className="h-3 w-3" />وەڵام
            </Button>
          )}
          {user && profileId && (comment.author_id === profileId || isAdmin) && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(comment.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
    </div>
  </div>
);

const CommentsSection = ({ targetId, targetType }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { data: comments, isLoading } = useComments(targetId, targetType);
  const createComment = useCreateComment();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const totalCount = (comments ?? []).reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

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
        parent_id: replyingTo?.id || null,
      });
      setBody("");
      setReplyingTo(null);
      toast.success(replyingTo ? "وەڵامەکەت نێردرا!" : "لێدوانەکەت نێردرا!");
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
        لێدوانەکان ({totalCount})
      </h3>

      {comments && comments.length > 0 && (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <div key={c.id}>
              <CommentItem comment={c} user={user} profileId={profile?.id} onDelete={handleDelete} onReply={setReplyingTo} />
              {c.replies && c.replies.length > 0 && (
                <div className="space-y-2 mt-2">
                  {c.replies.map((r) => (
                    <CommentItem key={r.id} comment={r} user={user} profileId={profile?.id} onDelete={handleDelete} onReply={setReplyingTo} isReply />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          {replyingTo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5">
              <Reply className="h-3 w-3" />
              <span>وەڵامدان بۆ <strong className="text-foreground">{replyingTo.profiles?.display_name}</strong></span>
              <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0 mr-auto" onClick={() => setReplyingTo(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={replyingTo ? "وەڵامێک بنووسە..." : "لێدوانێک بنووسە..."}
              className="min-h-[60px] flex-1"
              maxLength={2000}
            />
            <Button type="submit" size="sm" disabled={createComment.isPending} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
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
