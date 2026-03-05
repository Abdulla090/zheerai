import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockQuestions } from "@/lib/mock-data";
import { containerFast, fadeUpSmall } from "@/lib/animations";

type SortMode = "newest" | "votes" | "unanswered";

const QA = () => {
  const [sort, setSort] = useState<SortMode>("newest");
  const sorted = [...mockQuestions].sort((a, b) => {
    if (sort === "votes") return b.votes_count - a.votes_count;
    if (sort === "unanswered") return a.answers_count - b.answers_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="py-10 md:py-14">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">پرسیار و وەڵام</h1>
            <p className="mt-2 text-sm text-muted-foreground">پرسیار بکە و وەڵام وەربگرە لە کۆمەڵگاکە</p>
          </div>
          <Button>پرسیاری نوێ</Button>
        </div>
        <div className="mb-6 flex items-center gap-2">
          {(["newest", "votes", "unanswered"] as SortMode[]).map((s) => (
            <Button key={s} variant={sort === s ? "default" : "outline"} size="sm" onClick={() => setSort(s)}>
              {s === "newest" ? "نوێترین" : s === "votes" ? "زۆرترین دەنگ" : "بێ وەڵام"}
            </Button>
          ))}
        </div>
        <motion.div variants={containerFast} initial="hidden" animate="show" key={sort} className="space-y-3">
          {sorted.map((q) => (
            <motion.div key={q.id} variants={fadeUpSmall}>
              <Card className="border-border transition-shadow hover:shadow-sm cursor-pointer">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <button className="text-muted-foreground hover:text-primary transition-colors p-0.5"><ChevronUp className="h-4 w-4" /></button>
                    <span className="text-sm font-bold text-foreground">{q.votes_count}</span>
                    <button className="text-muted-foreground hover:text-destructive transition-colors p-0.5"><ChevronDown className="h-4 w-4" /></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors">{q.title}</h3>
                      {q.is_solved && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">{q.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {q.tags.map((tag) => (
                        <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                      ))}
                      <span className="text-[10px] text-muted-foreground mr-auto">{q.author.display_name} · {q.answers_count} وەڵام</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default QA;
