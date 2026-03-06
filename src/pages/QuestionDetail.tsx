import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, Clock, User, Send, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuestion } from "@/hooks/useQuestions";
import { useComments, useCreateComment } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import VoteButtons from "@/components/VoteButtons";

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ئێستا";
  if (mins < 60) return `${mins} خولەک`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} کاتژمێر`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ڕۆژ`;
  const months = Math.floor(days / 30);
  return `${months} مانگ`;
};

const InlineComments = ({ targetId, targetType }: { targetId: string; targetType: string }) => {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { data: comments } = useComments(targetId, targetType);
  const createComment = useCreateComment();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!body.trim()) {
      toast.error("ناوەڕۆکی کۆمێنت پێویستە");
      return;
    }

    try {
      await createComment.mutateAsync({
        content: body.trim(),
        author_id: profile.id,
        target_id: targetId,
        target_type: targetType,
      });
      setBody("");
      toast.success("کۆمێنتەکەت نێردرا!");
    } catch {
      toast.error("هەڵەیەک ڕوویدا");
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      toast.error("نەتوانرا بسڕدرێتەوە");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["comments", targetId, targetType] });
    toast.success("کۆمێنتەکە سڕایەوە");
  };

  return (
    <div className="space-y-3">
      {comments && comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 group">
              <Link to={c.author_id ? `/user/${c.author_id}` : "#"}>
                <Avatar className="h-8 w-8 mt-0.5">
                  {c.profiles?.avatar_url ? <AvatarImage src={c.profiles.avatar_url} alt="" /> : null}
                  <AvatarFallback className="bg-accent text-[10px]">
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="rounded-lg bg-accent/40 px-3 py-2.5">
                  <Link
                    to={c.author_id ? `/user/${c.author_id}` : "#"}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {c.profiles?.display_name}
                  </Link>
                  <p className="text-sm text-foreground/90 leading-relaxed mt-0.5 whitespace-pre-wrap">{c.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-[11px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                  {user && profile && c.author_id === profile.id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      سڕینەوە
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">هێشتا هیچ کۆمێنتێک نییە</p>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="flex items-start gap-2 pt-1 border-t border-border/40">
          <Avatar className="h-8 w-8 mt-2">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
            <AvatarFallback className="bg-accent text-[10px]">
              <User className="h-3.5 w-3.5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2 pt-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="کۆمێنتێک بنووسە..."
              className="min-h-[42px] max-h-[140px] text-sm flex-1 resize-none bg-accent/30 border-border/50"
              maxLength={2000}
              rows={1}
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              disabled={createComment.isPending || !body.trim()}
              className="h-10 w-10 p-0 shrink-0 text-primary hover:bg-primary/10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center text-xs text-muted-foreground py-2 border-t border-border/40">
          بۆ کۆمێنتکردن دەبێت <Link to="/login" className="text-primary hover:underline">بچیتەژوورەوە</Link>
        </p>
      )}
    </div>
  );
};

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: question, isLoading } = useQuestion(id!);
  const { data: questionComments } = useComments(id!, "question");
  const { data: profile } = useCurrentProfile();
  const [showQuestionComments, setShowQuestionComments] = useState(false);

  useEffect(() => {
    if (id) {
      supabase.rpc("increment_view_count", { table_name: "questions", row_id: id }).then();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-3xl space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!question) {
    return <div className="py-20 text-center text-muted-foreground">پرسیارەکە نەدۆزرایەوە</div>;
  }

  return (
    <div className="py-6 md:py-10">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <Link to={question.author_id ? `/user/${question.author_id}` : "#"}>
                <Avatar className="h-11 w-11 ring-2 ring-border">
                  {question.profiles?.avatar_url ? (
                    <AvatarImage src={question.profiles.avatar_url} alt={question.profiles.display_name || ""} />
                  ) : null}
                  <AvatarFallback className="bg-accent">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="secondary" className="text-[10px]">پرسیار</Badge>
                  <Link
                    to={question.author_id ? `/user/${question.author_id}` : "#"}
                    className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {question.profiles?.display_name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(question.created_at)} لەمەوبەر
                </div>
              </div>
              {profile && question.author_id === profile.id && (
                <Link to={`/qa/${question.id}/edit`} className="shrink-0">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />دەستکاری
                  </Button>
                </Link>
              )}
            </div>

            <h1 className="text-lg md:text-xl font-bold text-foreground leading-snug mb-3">{question.title}</h1>

            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-4">{question.body}</p>

            {/* Question image */}
            {(question as any).image_url && (
              <div className="mb-4">
                <img
                  src={(question as any).image_url}
                  alt=""
                  className="w-full max-h-[400px] object-contain rounded-lg border border-border bg-accent/20"
                  loading="lazy"
                />
              </div>
            )}

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px] font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 px-5 md:px-6 py-3 border-t border-border/60 bg-accent/20">
            <VoteButtons targetId={question.id} targetType="question" currentCount={question.votes_count} />
            <button
              onClick={() => setShowQuestionComments(!showQuestionComments)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full px-3 py-1.5 hover:bg-accent/60"
            >
              <MessageCircle className="h-4 w-4" />
              {questionComments?.length || 0} کۆمێنت
              {showQuestionComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <AnimatePresence>
            {showQuestionComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 md:px-6 py-4 border-t border-border/40 bg-accent/10">
                  <InlineComments targetId={question.id} targetType="question" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionDetail;
