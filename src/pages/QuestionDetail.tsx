import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowBigUp, ArrowBigDown, CheckCircle2, Loader2, MessageCircle, Clock, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuestion, useAnswers, useCreateAnswer } from "@/hooks/useQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";

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

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: question, isLoading } = useQuestion(id!);
  const { data: answers, isLoading: answersLoading } = useAnswers(id!);
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const createAnswer = useCreateAnswer();
  const [answerBody, setAnswerBody] = useState("");

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

  if (isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-3xl space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
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
    <div className="py-8 md:py-12">
      <div className="container max-w-3xl">

        {/* ===== QUESTION POST ===== */}
        <div className="rounded-xl border border-border bg-card mb-6">
          <div className="p-5 md:p-6">
            {/* Author header */}
            <div className="flex items-center gap-3 mb-4">
              <Link to={question.author_id ? `/user/${question.author_id}` : "#"}>
                <Avatar className="h-10 w-10">
                  {question.profiles?.avatar_url ? (
                    <AvatarImage src={question.profiles.avatar_url} alt={question.profiles.display_name || ""} />
                  ) : null}
                  <AvatarFallback className="bg-accent">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  to={question.author_id ? `/user/${question.author_id}` : "#"}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {question.profiles?.display_name}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(question.created_at)} لەمەوبەر
                </div>
              </div>
              {question.is_solved && (
                <Badge variant="default" className="mr-auto gap-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" /> چارەسەرکرا
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-lg md:text-xl font-bold text-foreground mb-3 leading-snug">
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

            {/* Engagement bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1 rounded-full bg-accent/50 px-1">
                <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-accent">
                  <ArrowBigUp className="h-5 w-5" />
                </button>
                <span className="text-sm font-bold text-foreground min-w-[20px] text-center">{question.votes_count}</span>
                <button className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-accent">
                  <ArrowBigDown className="h-5 w-5" />
                </button>
              </div>
              <LikeButton targetId={question.id} targetType="question" />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                {answers?.length || 0} وەڵام
              </span>
            </div>
          </div>
        </div>

        {/* ===== WRITE ANSWER (prominent, before answers) ===== */}
        {user ? (
          <div className="rounded-xl border border-border bg-card p-4 md:p-5 mb-6">
            <div className="flex items-center gap-2.5 mb-3">
              <Avatar className="h-8 w-8">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name || ""} />
                ) : null}
                <AvatarFallback className="bg-accent text-xs">
                  <User className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">وەڵامت بنووسە</span>
            </div>
            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <Textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="وەڵامەکەت لێرە بنووسە..."
                className="min-h-[100px] bg-background"
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
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-5 mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              بۆ وەڵامدانەوە دەبێت{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">بچیتەژوورەوە</Link>
            </p>
          </div>
        )}

        {/* ===== ANSWERS ===== */}
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
            <MessageCircle className="h-4 w-4" />
            {answersLoading ? "..." : `${answers?.length || 0} وەڵام`}
          </h2>

          <div className="space-y-3">
            {answers?.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card">
                <div className="p-4 md:p-5">
                  {/* Answer author */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <Link to={a.author_id ? `/user/${a.author_id}` : "#"}>
                      <Avatar className="h-8 w-8">
                        {a.profiles?.avatar_url ? (
                          <AvatarImage src={a.profiles.avatar_url} alt={a.profiles.display_name || ""} />
                        ) : null}
                        <AvatarFallback className="bg-accent text-xs">
                          <User className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link
                        to={a.author_id ? `/user/${a.author_id}` : "#"}
                        className="text-xs font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {a.profiles?.display_name}
                      </Link>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(a.created_at)} لەمەوبەر
                      </div>
                    </div>
                    {a.is_accepted && (
                      <Badge variant="default" className="mr-auto gap-1 text-[10px] px-2">
                        <CheckCircle2 className="h-3 w-3" /> وەڵامی پەسەندکراو
                      </Badge>
                    )}
                  </div>

                  {/* Answer body */}
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-3">{a.body}</p>

                  {/* Answer engagement */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 rounded-full bg-accent/50 px-1">
                      <button className="p-1 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-accent">
                        <ArrowBigUp className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-bold text-foreground min-w-[16px] text-center">{a.votes_count}</span>
                      <button className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-accent">
                        <ArrowBigDown className="h-4 w-4" />
                      </button>
                    </div>
                    <LikeButton targetId={a.id} targetType="answer" size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== COMMENTS on the question ===== */}
        <CommentsSection targetId={question.id} targetType="question" />
      </div>
    </div>
  );
};

export default QuestionDetail;
