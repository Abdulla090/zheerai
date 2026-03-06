import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowBigUp, CheckCircle2, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuestions } from "@/hooks/useQuestions";
import { useAuth } from "@/hooks/useAuth";
import { containerFast, fadeUpSmall } from "@/lib/animations";

type SortMode = "newest" | "votes" | "comments";

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

const QA = () => {
  const [sort, setSort] = useState<SortMode>("newest");
  const { data: questions, isLoading } = useQuestions(sort);
  const { user } = useAuth();

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">پرسیار و وەڵام</h1>
            <p className="mt-1 text-xs text-muted-foreground">پرسیار بکە و وەڵام وەربگرە لە کۆمەڵگاکە</p>
          </div>
          {user ? (
            <Button asChild size="sm">
              <Link to="/qa/new"><Plus className="h-4 w-4 ml-1.5" />پرسیاری نوێ</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to="/login">چوونەژوورەوە بۆ پرسیارکردن</Link>
            </Button>
          )}
        </div>

        {/* Sort tabs */}
        <div className="mb-5 flex items-center gap-1 border-b border-border pb-2">
          {(["newest", "votes", "comments"] as SortMode[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                sort === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {s === "newest" ? "نوێترین" : s === "votes" ? "زۆرترین دەنگ" : "زۆرترین کۆمێنت"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div variants={containerFast} initial="hidden" animate="show" key={sort} className="space-y-3">
            {questions?.map((q) => (
              <motion.div key={q.id} variants={fadeUpSmall}>
                <Link to={`/qa/${q.id}`} className="block">
                  <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
                    {/* Author row */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <Avatar className="h-8 w-8">
                        {q.profiles?.avatar_url ? (
                          <AvatarImage src={q.profiles.avatar_url} alt={q.profiles.display_name || ""} />
                        ) : null}
                        <AvatarFallback className="bg-accent text-xs">
                          <User className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-foreground">{q.profiles?.display_name}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(q.created_at)} لەمەوبەر
                        </span>
                      </div>
                      {q.is_solved && (
                        <Badge variant="default" className="mr-auto gap-1 text-[10px] px-2 py-0.5">
                          <CheckCircle2 className="h-3 w-3" /> چارەسەرکرا
                        </Badge>
                      )}
                    </div>

                    {/* Title & body */}
                    <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-1.5">
                      {q.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{q.body}</p>

                    {/* Tags */}
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {q.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Engagement bar */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <ArrowBigUp className="h-4 w-4" />
                        {q.votes_count} دەنگ
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {q.answers_count} وەڵام
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && questions?.length === 0 && (
          <div className="py-20 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">هیچ پرسیارێک نەدۆزرایەوە</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QA;
