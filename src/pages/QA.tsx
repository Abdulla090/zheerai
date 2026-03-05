import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuestions } from "@/hooks/useQuestions";
import { useAuth } from "@/hooks/useAuth";
import { containerFast, fadeUpSmall } from "@/lib/animations";

type SortMode = "newest" | "votes" | "unanswered";

const QA = () => {
  const [sort, setSort] = useState<SortMode>("newest");
  const { data: questions, isLoading } = useQuestions(sort);
  const { user } = useAuth();

  return (
    <div className="py-10 md:py-14">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">پرسیار و وەڵام</h1>
            <p className="mt-2 text-sm text-muted-foreground">پرسیار بکە و وەڵام وەربگرە لە کۆمەڵگاکە</p>
          </div>
          {user ? (
            <Button asChild>
              <Link to="/qa/new"><Plus className="h-4 w-4 ml-2" />پرسیاری نوێ</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">چوونەژوورەوە بۆ پرسیارکردن</Link>
            </Button>
          )}
        </div>
        <div className="mb-6 flex items-center gap-2">
          {(["newest", "votes", "unanswered"] as SortMode[]).map((s) => (
            <Button key={s} variant={sort === s ? "default" : "outline"} size="sm" onClick={() => setSort(s)}>
              {s === "newest" ? "نوێترین" : s === "votes" ? "زۆرترین دەنگ" : "بێ وەڵام"}
            </Button>
          ))}
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border"><CardContent className="p-5"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-3 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <motion.div variants={containerFast} initial="hidden" animate="show" key={sort} className="space-y-3">
            {questions?.map((q) => (
              <motion.div key={q.id} variants={fadeUpSmall}>
                <Link to={`/qa/${q.id}`}>
                  <Card className="border-border transition-shadow hover:shadow-sm cursor-pointer">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex shrink-0 flex-col items-center gap-0.5">
                        <span className="text-muted-foreground p-0.5"><ChevronUp className="h-4 w-4" /></span>
                        <span className="text-sm font-bold text-foreground">{q.votes_count}</span>
                        <span className="text-muted-foreground p-0.5"><ChevronDown className="h-4 w-4" /></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors">{q.title}</h3>
                          {q.is_solved && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">{q.body}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {q.tags?.map((tag) => (
                            <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                          ))}
                          <span className="text-[10px] text-muted-foreground mr-auto">{q.profiles?.display_name} · {q.answers_count} وەڵام</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        {!isLoading && questions?.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">هیچ پرسیارێک نەدۆزرایەوە</div>
        )}
      </div>
    </div>
  );
};

export default QA;
