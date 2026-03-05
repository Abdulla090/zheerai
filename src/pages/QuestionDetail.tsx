import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronUp, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuestion, useAnswers, useCreateAnswer } from "@/hooks/useQuestions";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: question, isLoading } = useQuestion(id!);
  const { data: answers, isLoading: answersLoading } = useAnswers(id!);
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const createAnswer = useCreateAnswer();
  const [answerBody, setAnswerBody] = useState("");

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
      <div className="py-10 md:py-14">
        <div className="container max-w-3xl space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!question) {
    return <div className="py-20 text-center text-muted-foreground">پرسیارەکە نەدۆزرایەوە</div>;
  }

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-3xl">
        {/* Question */}
        <Card className="border-border mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex shrink-0 flex-col items-center gap-0.5">
                <button className="text-muted-foreground hover:text-primary transition-colors p-1"><ChevronUp className="h-5 w-5" /></button>
                <span className="text-lg font-bold text-foreground">{question.votes_count}</span>
                <button className="text-muted-foreground hover:text-destructive transition-colors p-1"><ChevronDown className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <h1 className="text-lg font-bold text-foreground">{question.title}</h1>
                  {question.is_solved && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{question.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {question.tags?.map((tag) => (
                    <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                  ))}
                  <span className="text-[10px] text-muted-foreground mr-auto">
                    {question.author_id ? (
                      <Link to={`/user/${question.author_id}`} className="hover:text-primary transition-colors">{question.profiles?.display_name}</Link>
                    ) : question.profiles?.display_name} · {new Date(question.created_at).toLocaleDateString("ku")}
                  </span>
                </div>
                <div className="mt-3">
                  <LikeButton targetId={question.id} targetType="question" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-foreground mb-4">
            {answersLoading ? "..." : `${answers?.length || 0} وەڵام`}
          </h2>
          <div className="space-y-3">
            {answers?.map((a) => (
              <Card key={a.id} className="border-border">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex shrink-0 flex-col items-center gap-0.5">
                      <button className="text-muted-foreground hover:text-primary transition-colors p-0.5"><ChevronUp className="h-4 w-4" /></button>
                      <span className="text-sm font-bold text-foreground">{a.votes_count}</span>
                      <button className="text-muted-foreground hover:text-destructive transition-colors p-0.5"><ChevronDown className="h-4 w-4" /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      {a.is_accepted && (
                        <div className="mb-2 flex items-center gap-1 text-primary text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> وەڵامی پەسەندکراو
                        </div>
                      )}
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{a.body}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {a.author_id ? (
                            <Link to={`/user/${a.author_id}`} className="hover:text-primary transition-colors">{a.profiles?.display_name}</Link>
                          ) : a.profiles?.display_name} · {new Date(a.created_at).toLocaleDateString("ku")}
                        </span>
                        <LikeButton targetId={a.id} targetType="answer" size="sm" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comments on question */}
        <CommentsSection targetId={question.id} targetType="question" />

        {/* Submit Answer */}
        <div className="mt-8">
          {user ? (
            <Card className="border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">وەڵامت بنووسە</h3>
                <form onSubmit={handleSubmitAnswer} className="space-y-3">
                  <Textarea value={answerBody} onChange={(e) => setAnswerBody(e.target.value)} placeholder="وەڵامەکەت لێرە بنووسە..." className="min-h-[100px]" maxLength={5000} />
                  <Button type="submit" disabled={createAnswer.isPending}>
                    {createAnswer.isPending ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />ناردن...</> : "وەڵام بنێرە"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardContent className="p-5 text-center text-sm text-muted-foreground">
                بۆ وەڵامدانەوە دەبێت <a href="/login" className="text-primary hover:underline">بچیتەژوورەوە</a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
