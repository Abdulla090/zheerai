import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, Cpu, MessageCircleQuestion, FileText, Users, FolderOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockProjects, mockQuestions, mockBlogPosts, communityStats } from "@/lib/mock-data";
import { container, fadeUp } from "@/lib/animations";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Users, value: communityStats.members, label: "ئەندام" },
  { icon: FolderOpen, value: communityStats.projects, label: "پڕۆژە" },
  { icon: MessageCircleQuestion, value: communityStats.questions, label: "پرسیار" },
  { icon: FileText, value: communityStats.blog_posts, label: "بابەت" },
];

const Index = () => {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statsRef.current) return;
    const items = statsRef.current.querySelectorAll(".stat-item");
    gsap.fromTo(
      items,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
      }
    );
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-purple-soft py-24 md:py-32">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              کۆمەڵگای زیرەکی دەستکرد لە کوردستان
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              پڕۆژەکانت پیشان بدە،
              <br />
              <span className="text-primary">فێربە و هاوکاری بکە</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
              ZHEERAI شوێنێکە بۆ گەشەپێدەران، توێژەران، و خولیاکانی زیرەکی دەستکرد لە کوردستان.
              پڕۆژەکانت بنێرە، پرسیار بکە، بابەت بنووسە.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/projects">
                  پڕۆژەکان ببینە
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/qa">پرسیار بکە</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Stats */}
      <section ref={statsRef} className="border-b border-border bg-background py-12">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item flex flex-col items-center gap-2 text-center opacity-0">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{stat.value.toLocaleString("ar-SA")}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">پڕۆژە تایبەتەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">نوێترین پڕۆژەکانی کۆمەڵگا</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects" className="text-primary">هەموو ببینە <ArrowLeft className="mr-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {mockProjects.map((project) => (
              <motion.div key={project.id} variants={fadeUp}>
                <Card className="group h-full cursor-pointer border-border transition-shadow hover:shadow-md">
                  <div className="aspect-video w-full bg-accent" />
                  <CardContent className="p-4">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{project.author.display_name}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{project.views_count}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Latest Questions */}
      <section className="bg-purple-soft py-16 md:py-20">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">نوێترین پرسیارەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">پرسیار بکە و وەڵام وەربگرە</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/qa" className="text-primary">هەموو ببینە <ArrowLeft className="mr-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="space-y-3">
            {mockQuestions.map((q) => (
              <motion.div key={q.id} variants={fadeUp}>
                <Card className="border-border transition-shadow hover:shadow-sm">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex shrink-0 flex-col items-center gap-1 rounded-md bg-accent px-3 py-2 text-center">
                      <span className="text-lg font-bold text-primary">{q.votes_count}</span>
                      <span className="text-[10px] text-muted-foreground">دەنگ</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer">{q.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {q.tags.map((tag) => (
                          <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                        ))}
                        <span className="text-[10px] text-muted-foreground">{q.answers_count} وەڵام</span>
                        {q.is_solved && (
                          <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">چارەسەرکراو</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">نوێترین بابەتەکان</h2>
              <p className="mt-1 text-sm text-muted-foreground">بابەت و فێرکاری لەسەر زیرەکی دەستکرد</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/blog" className="text-primary">هەموو ببینە <ArrowLeft className="mr-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {mockBlogPosts.map((post) => (
              <motion.div key={post.id} variants={fadeUp}>
                <Card className="group h-full cursor-pointer border-border transition-shadow hover:shadow-md">
                  <div className="aspect-[16/9] w-full bg-accent" />
                  <CardContent className="p-4">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{post.author.display_name}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views_count.toLocaleString("ar-SA")}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">ئامادەیت ببیتە بەشێک لە کۆمەڵگاکە؟</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80 leading-relaxed">ئێستا تۆمار بکە و پڕۆژەکانت بنێرە، پرسیار بکە، و بابەت بنووسە.</p>
          <Button variant="secondary" size="lg" className="mt-8">تۆمارکردن</Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
