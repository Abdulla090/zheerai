import { useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Calendar, ArrowLeft, Cpu, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import { containerFast, fadeUpSmall } from "@/lib/animations";
import SEOHead from "@/components/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";

const BASE_URL = "https://kurdistanai.app";

const BlogCard = memo(({ post }: { post: any }) => (
  <Link to={`/blog/${post.id}`}>
    <Card className="group h-full cursor-pointer border-border transition-shadow hover:shadow-md">
      {post.cover_image_url ? (
        <img src={post.cover_image_url} alt={post.title} className="aspect-[16/9] w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <div className="aspect-[16/9] w-full bg-accent" aria-hidden="true" />
      )}
      <CardContent className="p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {post.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
          ))}
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.created_at).toLocaleDateString("ku")}
          </span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views_count}</span>
        </div>
      </CardContent>
    </Card>
  </Link>
));
BlogCard.displayName = "BlogCard";

const Index = () => {
  const isMobile = useIsMobile();
  const { data: blogPosts, isLoading } = useBlogPosts();
  const { user } = useAuth();

  const featured = blogPosts?.[0];
  const recent = blogPosts?.slice(1, 7) ?? [];
  const popular = useMemo(() => {
    if (!blogPosts || blogPosts.length < 2) return [];
    return [...blogPosts].sort((a, b) => b.views_count - a.views_count).slice(0, 4);
  }, [blogPosts]);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kurdistan AI",
    alternateName: ["KurdistanAI", "Kurdistan Ai", "Kurd AI", "کوردستان ئەی ئای", "کوردستان AI"],
    url: BASE_URL,
    description: "The first and largest AI journal in Kurdistan. Articles, tutorials, and news about artificial intelligence in Kurdish (Sorani).",
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
        description="Kurdistan AI — The first AI journal in Kurdistan. Articles, tutorials, and news about artificial intelligence in Kurdish Sorani. کوردستان ئەی ئای — یەکەمین گۆڤاری زیرەکی دەستکرد لە کوردستان."
        jsonLd={jsonLd}
        keywords="Kurdistan AI, کوردستان ئەی ئای, Kurd AI, Kurdish AI, AI journal Kurdistan, AI articles Kurdish, زیرەکی دەستکرد, AI کوردستان"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-purple-soft py-14 md:py-24" aria-labelledby="hero-heading">
        <div className="container relative z-10">
          <motion.div initial={isMobile ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              گۆڤاری زیرەکی دەستکرد لە کوردستان
            </div>
            <h1 id="hero-heading" className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              نوێترین بابەتەکانی<br /><span className="text-primary">زیرەکی دەستکرد بە کوردی</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
              بابەت، فێرکاری، و هەواڵی AI بە زمانی کوردی سۆرانی.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild><Link to="/blog">هەموو بابەتەکان <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /></Link></Button>
              {user && (
                <Button variant="outline" size="lg" asChild><Link to="/blog/new"><Plus className="h-4 w-4 ml-2" />نوسینی بابەت</Link></Button>
              )}
            </div>
          </motion.div>
        </div>
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl hidden md:block" aria-hidden="true" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl hidden md:block" aria-hidden="true" />
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="py-10 md:py-14" aria-labelledby="featured-heading">
          <div className="container">
            <h2 id="featured-heading" className="sr-only">بابەتی تایبەت</h2>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Link to={`/blog/${featured.id}`}>
                <Card className="group cursor-pointer overflow-hidden border-border transition-shadow hover:shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {featured.cover_image_url ? (
                      <img src={featured.cover_image_url} alt={featured.title} className="aspect-video object-cover md:aspect-auto md:min-h-[280px] w-full" loading="lazy" decoding="async" />
                    ) : (
                      <div className="aspect-video bg-accent md:aspect-auto md:min-h-[280px]" />
                    )}
                    <CardContent className="flex flex-col justify-center p-6 md:p-8">
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {featured.tags?.map((tag) => (
                          <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors md:text-2xl">{featured.title}</h3>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                      <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{featured.profiles?.display_name}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(featured.created_at).toLocaleDateString("ku")}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{featured.views_count}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-10 md:py-14" aria-labelledby="recent-heading">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 id="recent-heading" className="text-2xl font-bold text-foreground">نوێترین بابەتەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">تازەترین نوسینەکانی کۆمەڵگا</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/blog" className="text-primary">هەموو ببینە <ArrowLeft className="mr-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-56" />)}
            </div>
          ) : (
            <motion.div variants={containerFast} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((post) => (
                <motion.div key={post.id} variants={fadeUpSmall}>
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {!isLoading && (!blogPosts || blogPosts.length === 0) && (
            <div className="py-10 text-center text-sm text-muted-foreground">هێشتا هیچ بابەتێک نییە</div>
          )}
        </div>
      </section>

      {/* Popular Posts */}
      {popular.length > 0 && (
        <section className="bg-purple-soft py-10 md:py-14" aria-labelledby="popular-heading">
          <div className="container">
            <div className="mb-8">
              <h2 id="popular-heading" className="text-2xl font-bold text-foreground">باوترین بابەتەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">زۆرترین بینراو لەلایەن خوێنەرانەوە</p>
            </div>
            <motion.div variants={containerFast} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((post) => (
                <motion.div key={post.id} variants={fadeUpSmall}>
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20" aria-labelledby="cta-heading">
        <div className="container text-center">
          <h2 id="cta-heading" className="text-2xl font-bold text-primary-foreground md:text-3xl">دەتەوێت بابەتێک بنووسیت؟</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80 leading-relaxed">تۆمار بکە و بابەتەکانت لەسەر زیرەکی دەستکرد بنووسە بە کوردی.</p>
          <Button variant="secondary" size="lg" className="mt-8" asChild>
            <Link to={user ? "/blog/new" : "/signup"}>{user ? "نوسینی بابەت" : "تۆمارکردن"}</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Index;
