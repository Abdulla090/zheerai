import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Loader2, MessageCircle, Clock, User, Send, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuestion, useAnswers, useCreateAnswer } from "@/hooks/useQuestions";
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

/* ─── Inline Comments Section (collapsible) ─── */
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
    if (!body.trim()) { toast.error("ناوەڕۆکی کۆمێنت پێویستە"); return; }
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
    if (error) { toast.error("نەتوانرا بسڕدرێتەوە"); return; }
    queryClient.invalidateQueries({ queryKey: ["comments", targetId, targetType] });
    toast.success("کۆمێنتەکە سڕایەوە");
  };

  return (
    <div className="space-y-3">
      {/* Existing comments first */}
      {comments && comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 group">
              <Link to={c.author_id ? `/user/${c.author_id}` : "#"}>
                <Avatar className="h-7 w-7 mt-0.5">
                  {c.profiles?.avatar_url ? (
                    <AvatarImage src={c.profiles.avatar_url} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-accent text-[10px]">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="rounded-lg bg-accent/40 px-3 py-2">
                  <Link
                    to={c.author_id ? `/user/${c.author_id}` : "#"}
                    className="text-xs font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {c.profiles?.display_name}
                  </Link>
                  <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">{c.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                  {user && profile && c.author_id === profile.id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      سڕینەوە
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write comment input - after existing comments */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex items-start gap-2 pt-1">
          <Avatar className="h-7 w-7 mt-0.5">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="" />
            ) : null}
            <AvatarFallback className="bg-accent text-[10px]">
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="کۆمێنتێک بنووسە..."
              className="min-h-[40px] max-h-[120px] text-sm flex-1 resize-none bg-accent/30 border-border/50"
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
        <p className="text-center text-xs text-muted-foreground py-2">
          بۆ کۆمێنتکردن دەبێت <Link to="/login" className="text-primary hover:underline">بچیتەژوورەوە</Link>
        </p>
      )}
    </div>
  );
};

/* ─── Main Page ─── */
const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: question, isLoading } = useQuestion(id!);
  const { data: answers, isLoading: answersLoading } = useAnswers(id!);
  const { data: questionComments } = useComments(id!, "question");
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const createAnswer = useCreateAnswer();
  const [answerBody, setAnswerBody] = useState("");
  const [showQuestionComments, setShowQuestionComments] = useState(false);
  const [expandedAnswerComments, setExpandedAnswerComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      supabase.rpc("increment_view_count", { table_name: "questions", row_id: id }).then();
    }
  }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !id) return;
    if (!answerBody.trim()) { toast.error("ناوەڕۆکی وەڵام پێویستە"); return; }
    try {
      await createAnswer.mutateAsync({
        question_id: id,
        body: answerBody.trim(),
        author_id: profile.id,
      });
      setAnswerBody("");
      toast.success("وەڵامەکەت نێردرا!");
    } catch (err: any) {
      toast.error(err.message || "هەڵەیەک ڕوویدا");
    }
  };

  const toggleAnswerComments = (answerId: string) => {
    setExpandedAnswerComments((prev) => {
      const next = new Set(prev);
      if (next.has(answerId)) next.delete(answerId);
      else next.add(answerId);
      return next;
    });
  };

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

        {/* ═══ QUESTION POST ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="p-5 md:p-6">
            {/* Author header */}
            <div className="flex items-center gap-3 mb-4">
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
                <Link
                  to={question.author_id ? `/user/${question.author_id}` : "#"}
                  className="text-sm font-bold text-foreground hover:text-primary transition-colors block"
                >
                  {question.profiles?.display_name}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  {timeAgo(question.created_at)} لەمەوبەر
                </div>
              </div>
              {question.is_solved && (
                <Badge variant="default" className="gap-1 text-xs shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" /> چارەسەرکرا
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-lg md:text-xl font-bold text-foreground leading-snug mb-3">
              {question.title}
            </h1>

            {/* Body */}
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-4">
              {question.body}
            </p>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px] font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Engagement bar */}
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
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground mr-auto">
              <MessageCircle className="h-3.5 w-3.5" />
              {answers?.length || 0} وەڵام
            </span>
          </div>

          {/* Collapsible comments */}
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

        {/* ═══ ANSWERS SECTION ═══ */}
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
            <MessageCircle className="h-4 w-4" />
            {answersLoading ? "..." : `${answers?.length || 0} وەڵام`}
          </h2>

          <div className="space-y-3">
            {answers?.map((a, i) => {
              const isExpanded = expandedAnswerComments.has(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="p-4 md:p-5">
                    {/* Answer author */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <Link to={a.author_id ? `/user/${a.author_id}` : "#"}>
                        <Avatar className="h-9 w-9 ring-2 ring-border">
                          {a.profiles?.avatar_url ? (
                            <AvatarImage src={a.profiles.avatar_url} alt={a.profiles.display_name || ""} />
                          ) : null}
                          <AvatarFallback className="bg-accent text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={a.author_id ? `/user/${a.author_id}` : "#"}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {a.profiles?.display_name}
                        </Link>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo(a.created_at)} لەمەوبەر
                        </div>
                      </div>
                      {a.is_accepted && (
                        <Badge variant="default" className="gap-1 text-[10px] px-2 shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> وەڵامی پەسەندکراو
                        </Badge>
                      )}
                    </div>

                    {/* Answer body */}
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{a.body}</p>
                  </div>

                  {/* Answer engagement */}
                  <div className="flex items-center gap-3 px-4 md:px-5 py-2.5 border-t border-border/60 bg-accent/20">
                    <VoteButtons targetId={a.id} targetType="answer" currentCount={a.votes_count} size="sm" />
                    <AnswerCommentToggle answerId={a.id} isExpanded={isExpanded} onToggle={() => toggleAnswerComments(a.id)} />
                  </div>

                  {/* Collapsible comments for this answer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-5 py-4 border-t border-border/40 bg-accent/10">
                          <InlineComments targetId={a.id} targetType="answer" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══ WRITE ANSWER ═══ */}
        <div className="mt-6">
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-4 md:p-5"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <Avatar className="h-9 w-9 ring-2 ring-border">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.display_name || ""} />
                  ) : null}
                  <AvatarFallback className="bg-accent text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">وەڵامت بنووسە</span>
              </div>
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                <Textarea
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                  placeholder="وەڵامەکەت لێرە بنووسە..."
                  className="min-h-[100px] bg-accent/20 border-border/50"
                  maxLength={5000}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={createAnswer.isPending} className="gap-1.5">
                    {createAnswer.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />ناردن...</>
                    ) : (
                      <><Send className="h-3.5 w-3.5" />وەڵام بنێرە</>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                بۆ وەڵامدانەوە دەبێت{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">بچیتەژوورەوە</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Small helper for answer comment count */
const AnswerCommentToggle = ({ answerId, isExpanded, onToggle }: { answerId: string; isExpanded: boolean; onToggle: () => void }) => {
  const { data: comments } = useComments(answerId, "answer");
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full px-3 py-1.5 hover:bg-accent/60"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      {comments?.length || 0} کۆمێنت
      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
    </button>
  );
};

export default QuestionDetail;
