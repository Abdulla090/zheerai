import { Link } from "react-router-dom";
import { useTutorials } from "@/hooks/useTutorials";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, Eye, Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import SEOHead from "@/components/SEOHead";

const Tutorials = () => {
  const { data: tutorials, isLoading } = useTutorials();

  const getVideoThumbnail = (url: string | null, type: string | null) => {
    if (type === "youtube" && url) {
      const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([\w-]+)/);
      if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
  };

  return (
    <>
      <SEOHead
        title="فێرکارییەکان | Kurdistan AI"
        description="فێرکاری و ڕێنمایی لە بواری ژیریی دەستکرد بە زمانی کوردی"
        path="/tutorials"
      />
      <div className="py-10 md:py-14">
        <div className="container max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">فێرکارییەکان</h1>
            <p className="text-muted-foreground">فێرکاری و ڕێنمایی لە بواری ژیریی دەستکرد بە زمانی کوردی</p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : !tutorials?.length ? (
            <div className="text-center py-20 text-muted-foreground">
              هێشتا هیچ فێرکارییەک نییە
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tutorials.map((t) => {
                const thumb = t.thumbnail_url || getVideoThumbnail(t.video_url, t.video_type);
                const isVideo = t.video_type && t.video_type !== "none";
                return (
                  <Link
                    key={t.id}
                    to={`/tutorials/${t.id}`}
                    className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/20"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {thumb ? (
                        <img src={thumb} alt={t.title} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {isVideo ? <Play className="h-10 w-10 text-muted-foreground/40" /> : <FileText className="h-10 w-10 text-muted-foreground/40" />}
                        </div>
                      )}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="rounded-full bg-background/90 p-3">
                            <Play className="h-6 w-6 text-foreground" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      {isVideo && (
                        <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
                          ڤیدیۆ
                        </Badge>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 p-4 gap-2">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {t.title}
                      </h3>
                      {t.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                      )}
                      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{t.views_count}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{t.likes_count}</span>
                        <span className="flex items-center gap-1 mr-auto">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(t.created_at), { locale: ar, addSuffix: true })}
                        </span>
                      </div>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {t.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tutorials;
