import { useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Calendar, ArrowLeft, TrendingUp, Clock, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import { containerFast, fadeUpSmall } from "@/lib/animations";
import SEOHead from "@/components/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";

const BASE_URL = "https://kurdistanai.app";

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} خولەک لەمەوپێش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} کاتژمێر لەمەوپێش`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ڕۆژ لەمەوپێش`;
  return new Date(dateStr).toLocaleDateString("ku");
}

function readTime(body: string) {
  const words = body?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

// Featured hero article — full width, editorial style
const HeroArticle = memo(({ post }: { post: any }) => (
  <Link to={`/blog/${post.id}`} className="block group">
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3 relative">
          {post.cover_image_url ? (
            <img src={post.cover_image_url} alt={post.title} className="aspect-[16/10] lg:aspect-auto lg:h-full w-full object-cover" loading="eager" decoding="async" />
          ) : (
            <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[400px] w-full bg-gradient-to-br from-primary/10 to-accent" />
          )}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-primary font-semibold text-[11px] gap-1">
              <Sparkles className="h-3 w-3" />
              تایبەت
            </Badge>
          </div>
        </div>
        <div className="lg:col-span-2 flex flex-col justify-center p-6 md:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {post.tags?.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-[10px] font-medium">{tag}</Badge>
            ))}
          </div>
          <h2 className="text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors md:text-2xl lg:text-3xl">
            {post.title}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-4">
            {post.excerpt}
          </p>
          <Separator className="my-5" />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{post.profiles?.display_name}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(post.body)} خولەک خوێندنەوە</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views_count}</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
));
HeroArticle.displayName = "HeroArticle";

// Standard article card — clean editorial card
const ArticleCard = memo(({ post, showImage = true }: { post: any; showImage?: boolean }) => (
  <Link to={`/blog/${post.id}`} className="block group h-full">
    <Card className="h-full cursor-pointer border-border bg-card transition-all hover:shadow-md hover:border-primary/20">
      {showImage && (
        post.cover_image_url ? (
          <img src={post.cover_image_url} alt={post.title} className="aspect-[16/9] w-full object-cover rounded-t-lg" loading="lazy" decoding="async" />
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/5 to-accent/50 rounded-t-lg" />
        )
      )}
      <CardContent className={showImage ? "p-5" : "p-5 pt-5"}>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {post.tags?.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-[10px] font-normal border-border">{tag}</Badge>
          ))}
        </div>
        <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors md:text-base">
          {post.title}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground/80">{post.profiles?.display_name}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(post.body)} خولەک</span>
        </div>
      </CardContent>
    </Card>
  </Link>
));
ArticleCard.displayName = "ArticleCard";

// Compact list item for sidebar/popular
const CompactArticle = memo(({ post, index }: { post: any; index: number }) => (
  <Link to={`/blog/${post.id}`} className="group flex items-start gap-3 py-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
      {index + 1}
    </span>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {post.title}
      </h4>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{post.profiles?.display_name}</span>
        <span>·</span>
        <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{post.views_count}</span>
      </div>
    </div>
    {post.cover_image_url && (
      <img src={post.cover_image_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" decoding="async" />
    )}
  </Link>
));
CompactArticle.displayName = "CompactArticle";

const Index = () => {
  const isMobile = useIsMobile();
  const { data: blogPosts, isLoading } = useBlogPosts();
  const { user } = useAuth();

  const featured = blogPosts?.[0];
  const recent = blogPosts?.slice(1, 7) ?? [];
  const popular = useMemo(() => {
    if (!blogPosts || blogPosts.length < 2) return [];
    return [...blogPosts].sort((a, b) => b.views_count - a.views_count).slice(0, 5);
  }, [blogPosts]);
  const moreArticles = blogPosts?.slice(7, 13) ?? [];

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kurdistan AI",
    alternateName: ["KurdistanAI", "Kurdistan Ai", "Kurd AI", "کوردستان ئەی ئای", "کوردستان AI"],
    url: BASE_URL,
    description: "The first and largest AI journal in Kurdistan. Articles, tutorials, and news about artificial intelligence in Kurdish Sorani.",
    inLanguage: ["ckb", "en"],
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
    },
  }), []);

  return (
    <>
      <SEOHead
        canonical={BASE_URL}
        description="Kurdistan AI — The first & largest AI journal in Kurdistan. Read the latest articles, news, tutorials & tips about artificial intelligence in Kurdish Sorani. یەکەمین و گەورەترین گۆڤاری AI بە کوردی."
        jsonLd={jsonLd}
        keywords="Kurdistan AI, کوردستان ئەی ئای, Kurd AI, Kurdish AI journal, AI magazine Kurdistan, AI news Kurdish, AI articles Kurdish, زیرەکی دەستکرد, گۆڤاری AI کوردی"
      />

      {/* Masthead */}
      <div className="border-b border-border bg-background">
        <div className="container flex items-center justify-between py-3">
          <p className="text-xs text-muted-foreground">یەکەمین و گەورەترین گۆڤاری AI بە زمانی کوردی سۆرانی</p>
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/blog/new">
                  <BookOpen className="h-3 w-3 ml-1" />
                  نوسینی بابەت
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/login">چوونەژوورەوە</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <section className="py-8 md:py-12" aria-labelledby="featured-heading">
        <div className="container">
          <h1 id="featured-heading" className="sr-only">Kurdistan AI — گۆڤاری زیرەکی دەستکرد بە کوردی</h1>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          ) : featured ? (
            <motion.div initial={isMobile ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <HeroArticle post={featured} />
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Recent + Popular sidebar layout */}
      <section className="py-6 md:py-10" aria-labelledby="recent-heading">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent — main column */}
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h2 id="recent-heading" className="text-lg font-bold text-foreground md:text-xl">نوێترین بابەتەکان</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/blog" className="text-primary text-xs">هەموو ببینە <ArrowLeft className="mr-1 h-3 w-3" /></Link>
                </Button>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
                </div>
              ) : (
                <motion.div variants={containerFast} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {recent.map((post) => (
                    <motion.div key={post.id} variants={fadeUpSmall}>
                      <ArticleCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Popular — sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">باوترینەکان</h2>
                </div>
                {isLoading ? (
                  <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                ) : popular.length > 0 ? (
                  <div className="divide-y divide-border">
                    {popular.map((post, i) => (
                      <CompactArticle key={post.id} post={post} index={i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4">هێشتا بابەتێک نییە</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More articles — full-width grid */}
      {moreArticles.length > 0 && (
        <section className="border-t border-border bg-accent/30 py-10 md:py-14" aria-labelledby="more-heading">
          <div className="container">
            <h2 id="more-heading" className="text-lg font-bold text-foreground mb-6 md:text-xl">بابەتی زیاتر</h2>
            <motion.div variants={containerFast} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moreArticles.map((post) => (
                <motion.div key={post.id} variants={fadeUpSmall}>
                  <ArticleCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!isLoading && (!blogPosts || blogPosts.length === 0) && (
        <section className="py-20">
          <div className="container text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">هێشتا هیچ بابەتێک نییە</h2>
            <p className="text-sm text-muted-foreground mb-6">یەکەم کەس بە بۆ نوسینی بابەت لەسەر زیرەکی دەستکرد!</p>
            {user ? (
              <Button asChild><Link to="/blog/new">نوسینی بابەت</Link></Button>
            ) : (
              <Button asChild><Link to="/signup">تۆمارکردن</Link></Button>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-14 md:py-20" aria-labelledby="cta-heading">
        <div className="container text-center">
          <h2 id="cta-heading" className="text-2xl font-bold text-primary-foreground md:text-3xl">بابەتێک بنووسە بۆ کۆمەڵگای کوردی</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80 leading-relaxed">
            زانستت هەیە لەسەر AI؟ بابەتێک بنووسە و بیبڵاوکەرەوە لە گەورەترین گۆڤاری کوردی بۆ زیرەکی دەستکرد.
          </p>
          <Button variant="secondary" size="lg" className="mt-8" asChild>
            <Link to={user ? "/blog/new" : "/signup"}>{user ? "نوسینی بابەت" : "تۆمارکردن"}</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Index;
