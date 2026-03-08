import { useEffect, useRef, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Cpu, MessageCircleQuestion, FileText, FolderOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { useQuestions } from "@/hooks/useQuestions";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { container, fadeUp } from "@/lib/animations";
import SEOHead from "@/components/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";

const BASE_URL = "https://kurdistanai.app";

const ProjectCard = memo(({ project }: { project: any }) => (
  <Link to={`/projects/${project.id}`}>
    <Card className="group h-full cursor-pointer border-border transition-shadow hover:shadow-md">
      {project.thumbnail_url ? (
        <img src={project.thumbnail_url} alt={project.title} className="aspect-video w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <div className="aspect-video w-full bg-accent" aria-hidden="true" />
      )}
      <CardContent className="p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {project.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
          ))}
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{project.profiles?.display_name}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{project.views_count}</span>
        </div>
      </CardContent>
    </Card>
  </Link>
));
ProjectCard.displayName = "ProjectCard";

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
          <span>{post.profiles?.display_name}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views_count}</span>
        </div>
      </CardContent>
    </Card>
  </Link>
));
BlogCard.displayName = "BlogCard";

const Index = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: questions, isLoading: questionsLoading } = useQuestions();
  const { data: blogPosts, isLoading: blogLoading } = useBlogPosts();

  // Only load GSAP on desktop for stat animations
  useEffect(() => {
    if (isMobile || !statsRef.current) return;
    let cleanup: (() => void) | undefined;
    import("gsap").then(({ default: gsap }) =>
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const items = statsRef.current?.querySelectorAll(".stat-item");
        if (!items) return;
        gsap.fromTo(items, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        });
        cleanup = () => ScrollTrigger.getAll().forEach((t) => t.kill());
      })
    );
    return () => cleanup?.();
  }, [isMobile]);

  const stats = useMemo(() => [
    { icon: FolderOpen, value: projects?.length ?? 0, label: "پڕۆژە" },
    { icon: MessageCircleQuestion, value: questions?.length ?? 0, label: "پرسیار" },
    { icon: FileText, value: blogPosts?.length ?? 0, label: "بابەت" },
  ], [projects?.length, questions?.length, blogPosts?.length]);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kurdistan AI",
    alternateName: ["KurdistanAI", "Kurdistan Ai", "Kurd AI", "کوردستان ئەی ئای", "کوردستان AI"],
    url: BASE_URL,
    description: "The first and largest artificial intelligence community in Kurdistan. A platform for AI projects, Q&A, and educational content in Kurdish (Sorani).",
    inLanguage: ["ckb", "en"],
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/qa?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }), []);

  return (
    <>
      <SEOHead
        canonical={BASE_URL}
        description="Kurdistan AI (کوردستان ئەی ئای) — یەکەمین و گەورەترین کۆمەڵگای زیرەکی دەستکرد لە کوردستان. پڕۆژە، پرسیار و وەڵام، فێرکاری AI بە کوردی. The first and most popular AI community in Kurdistan."
        jsonLd={jsonLd}
        keywords="Kurdistan AI, کوردستان ئەی ئای, Kurd AI, Kurdish AI, artificial intelligence Kurdistan, AI community Kurdistan, زیرەکی دەستکرد, AI کوردستان, KurdistanAI, most popular AI Kurdistan, first AI Kurdistan, AI in Kurdish language"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-purple-soft py-20 md:py-32" aria-labelledby="hero-heading">
        <div className="container relative z-10">
          <motion.div initial={isMobile ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              کۆمەڵگای زیرەکی دەستکرد لە کوردستان
            </div>
            <h1 id="hero-heading" className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              پڕۆژەکانت پیشان بدە،<br /><span className="text-primary">فێربە و هاوکاری بکە</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
              Kurdistan AI شوێنێکە بۆ گەشەپێدەران، توێژەران، و خولیاکانی زیرەکی دەستکرد لە کوردستان.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild><Link to="/projects">پڕۆژەکان ببینە <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /></Link></Button>
              <Button variant="outline" size="lg" asChild><Link to="/qa">پرسیار بکە</Link></Button>
            </div>
          </motion.div>
        </div>
        {/* Decorative blurs - hidden on mobile for GPU performance */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl hidden md:block" aria-hidden="true" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl hidden md:block" aria-hidden="true" />
      </section>

      {/* Stats */}
      <section ref={statsRef} className="border-b border-border bg-background py-12" aria-label="ئامارەکان">
        <div className="container grid grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-item flex flex-col items-center gap-2 text-center ${isMobile ? '' : 'opacity-0'}`}>
              <stat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 md:py-20" aria-labelledby="projects-heading">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 id="projects-heading" className="text-2xl font-bold text-foreground">پڕۆژە تایبەتەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">نوێترین پڕۆژەکانی کۆمەڵگا</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects" className="text-primary">هەموو ببینە <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" /></Link>
            </Button>
          </div>
          {projectsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-56" />)}
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {projects?.slice(0, 4).map((project) => (
                <motion.div key={project.id} variants={fadeUp}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {!projectsLoading && projects?.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">هێشتا هیچ پڕۆژەیەک زیاد نەکراوە</div>
          )}
        </div>
      </section>

      {/* Latest Questions */}
      <section className="bg-purple-soft py-16 md:py-20" aria-labelledby="questions-heading">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 id="questions-heading" className="text-2xl font-bold text-foreground">نوێترین پرسیارەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">پرسیار بکە و وەڵام وەربگرە</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/qa" className="text-primary">هەموو ببینە <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" /></Link>
            </Button>
          </div>
          {questionsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
          ) : (
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="space-y-3">
              {questions?.slice(0, 5).map((q) => (
                <motion.div key={q.id} variants={fadeUp}>
                  <Link to={`/qa/${q.id}`}>
                    <Card className="border-border transition-shadow hover:shadow-sm">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="flex shrink-0 flex-col items-center gap-1 rounded-md bg-accent px-3 py-2 text-center">
                          <span className="text-lg font-bold text-primary">{q.votes_count}</span>
                          <span className="text-[10px] text-muted-foreground">دەنگ</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer">{q.title}</h3>
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{q.body}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {q.tags?.map((tag) => (
                              <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                            ))}
                            <span className="text-[10px] text-muted-foreground">{q.answers_count} وەڵام</span>
                            {q.is_solved && <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">چارەسەرکراو</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
          {!questionsLoading && questions?.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">هێشتا هیچ پرسیارێک نییە</div>
          )}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-20" aria-labelledby="blog-heading">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 id="blog-heading" className="text-2xl font-bold text-foreground">نوێترین بابەتەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">بابەت و فێرکاری لەسەر زیرەکی دەستکرد</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/blog" className="text-primary">هەموو ببینە <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" /></Link>
            </Button>
          </div>
          {blogLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-56" />)}</div>
          ) : (
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {blogPosts?.slice(0, 3).map((post) => (
                <motion.div key={post.id} variants={fadeUp}>
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {!blogLoading && blogPosts?.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">هێشتا هیچ بابەتێک نییە</div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20" aria-labelledby="cta-heading">
        <div className="container text-center">
          <h2 id="cta-heading" className="text-2xl font-bold text-primary-foreground md:text-3xl">ئامادەیت ببیتە بەشێک لە کۆمەڵگاکە؟</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80 leading-relaxed">ئێستا تۆمار بکە و پڕۆژەکانت بنێرە، پرسیار بکە، و بابەت بنووسە.</p>
          <Button variant="secondary" size="lg" className="mt-8" asChild>
            <Link to="/signup">تۆمارکردن</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Index;
