import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Users, BookOpen, Cpu, Heart, Code, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";

// Lazy-load heavy images
const OrgLogo = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    className="h-full w-full object-cover"
  />
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const organizations = [
  {
    name: "ژیرساز • ZHEER SAZ",
    logo: "/zheer-saz-logo.jpg",
    telegram: "https://t.me/zheer_saz",
    description:
      "ژیرساز گرووپێکی تایبەتمەندە لە بواری زیرەکی دەستکرد و تەکنەلۆژیا، کە ئامانجی بەهێزکردنی کۆمەڵگای کوردی تەکنەلۆژییە لەڕێگەی فێرکاری، پڕۆژە، و ناوەڕۆکی بەسوودەوە.",
  },
  {
    name: "Kurdistan AI",
    logo: "/kurdistan-ai-logo.jpg",
    telegram: "https://t.me/KurdistanAI01",
    description:
      "Kurdistan AI کۆمەڵگایەکی چالاکە لە بواری زیرەکی دەستکرد لە کوردستان، کە خەریکی بڵاوکردنەوەی زانست و زانیاری لەسەر AI بۆ کوردان بە زمانی کوردی.",
  },
];

const values = [
  {
    icon: BookOpen,
    title: "فێربوونی ئازاد",
    description: "هەموو ناوەڕۆک و سەرچاوەکان بەخۆڕایین و بە زمانی کوردی سۆرانی بەردەستن.",
  },
  {
    icon: Users,
    title: "کۆمەڵگا",
    description: "شوێنێکین بۆ هەموو ئەو کەسانەی حەزیان بە زیرەکی دەستکردە — فێرخواز، گەشەپێدەر، و توێژەر.",
  },
  {
    icon: Cpu,
    title: "پڕۆژە و کردار",
    description: "تەنها قسە نییە — پڕۆژەکانت پیشان بدە، پرسیار بکە، و بابەت بنووسە.",
  },
  {
    icon: Heart,
    title: "خزمەتی کوردستان",
    description: "ئامانجمان بەرزکردنەوەی ئاستی زانستی تەکنەلۆژییە لە نێو کۆمەڵگای کوردیدا.",
  },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Kurdistan AI",
  "description": "Learn about Kurdistan AI — the first and largest AI community in Kurdistan. Founded to bridge the gap between AI and Kurdish learners.",
  "url": "https://kurdistanai.app/about",
  "mainEntity": {
    "@type": "Organization",
    "@id": "https://kurdistanai.app/#organization",
    "name": "Kurdistan AI",
    "founder": {
      "@type": "Person",
      "name": "Zheer Saz",
      "jobTitle": "Full Stack AI Solution Developer",
      "description": "Dedicated to bridging the gap between AI and Kurdish people learning in Kurdistan."
    }
  }
};

const About = () => {
  return (
    <>
      <SEOHead
        title="About Kurdistan AI | The First & Largest AI Community in Kurdistan"
        description="Join the premier ecosystem for Kurdish AI developers and researchers. Explore projects, technical Q&A, and free AI education in Sorani."
        canonical="https://kurdistanai.app/about"
        keywords="About Kurdistan AI, Kurdistan AI founder, Zheer Saz, AI community Kurdistan, Kurdish AI platform, first AI Kurdistan, AI education Kurdish"
        jsonLd={aboutJsonLd}
      />

      <div>
        {/* Hero */}
        <section className="relative overflow-hidden bg-purple-soft py-20 md:py-28">
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="mx-auto max-w-3xl text-center"
            >
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                دەربارەی <span className="text-primary">Kurdistan AI</span>: یەکەمین ناوەندی زیرەکی دەستکرد
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
                Kurdistan AI پلاتفۆرمێکی یەکگرتووە کە لەلایەن دوو ڕێکخراوی پێشەنگەوە دامەزراوە، بۆ ئەوەی کۆمەڵگای کوردی بتوانێت بە زمانی خۆی فێری زیرەکی دەستکرد ببێت — بەتەواوی بەخۆڕایی.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                <Link to="/projects" className="inline-flex items-center gap-1 text-primary hover:underline">
                  پڕۆژەکان <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span>•</span>
                <Link to="/qa" className="inline-flex items-center gap-1 text-primary hover:underline">
                  پرسیار و وەڵام <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span>•</span>
                <Link to="/blog" className="inline-flex items-center gap-1 text-primary hover:underline">
                  بڵاوکراوەکان <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </section>

        {/* Founder's Note */}
        <section className="py-16 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">دامەزرێنەران</h2>
              </div>
              <div className="space-y-4">
                <Card className="border-border">
                  <CardContent className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-foreground mb-2">Abdulla Aziz Hameed</h3>
                    <p className="text-xs text-primary font-medium mb-3">Full Stack AI Solution Developer — دامەزرێنەری ئەم وێبسایتە و ZHEER SAZ</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      ئەم وێبسایتەی دروستکردووە و ژیرسازی دامەزراندووە، بۆ ئەوەی پردێک دروست بکات نێوان زیرەکی دەستکرد و خەڵکی کوردستان. ئامانجی ئەوەیە هەموو فێرخوازێک و گەشەپێدەرێکی کورد بتوانێت بە زمانی خۆی فێری AI ببێت.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-foreground mb-2">Ahmad Nasradin</h3>
                    <p className="text-xs text-primary font-medium mb-3">دامەزرێنەری ئەم وێبسایتە و Kurdistan AI</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      هاوبەشی دامەزراندنی ئەم پلاتفۆرمە و Kurdistan AI، بۆ بەرزکردنەوەی ئاستی زانستی تەکنەلۆژی لە نێو کۆمەڵگای کوردیدا.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                Kurdistan AI تەنها پلاتفۆرمێک نییە — بزوتنەوەیەکە بۆ بەرزکردنەوەی ئاستی تەکنەلۆژی لە نێو کوردستاندا. سەردانی <Link to="/projects" className="text-primary hover:underline">پڕۆژەکان</Link> بکە، لە <Link to="/qa" className="text-primary hover:underline">پرسیار و وەڵام</Link> بەشداری بکە، یان <Link to="/blog" className="text-primary hover:underline">بابەتەکان</Link> بخوێنەوە.
              </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Organizations */}
        <section className="border-y border-border bg-accent/30 py-16 md:py-20">
          <div className="container">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="mx-auto max-w-4xl"
            >
              <motion.h2 variants={fadeUp} className="mb-3 text-center text-2xl font-bold text-foreground">
                دوو ڕێکخراو، یەک ئامانج
              </motion.h2>
              <motion.p variants={fadeUp} className="mb-12 text-center text-sm text-muted-foreground">
                ژیرساز و Kurdistan AI پێکەوە ئەم پلاتفۆرمەیان دروستکردووە
              </motion.p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {organizations.map((org) => (
                  <motion.div key={org.name} variants={fadeUp}>
                    <Card className="h-full border-border transition-shadow hover:shadow-md">
                      <CardContent className="flex flex-col items-center p-8 text-center">
                        <div className="mb-5 h-28 w-28 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                          <OrgLogo src={org.logo} alt={org.name} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{org.name}</h3>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                          {org.description}
                        </p>
                        <Button variant="outline" size="sm" className="mt-5 gap-2" asChild>
                          <a href={org.telegram} target="_blank" rel="noopener noreferrer">
                            تێلێگرام
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="text-2xl font-bold text-foreground">ئامانجی ئێمە</h2>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed md:text-lg">
                ئێمە باوەڕمان وایە هەموو کوردێک مافی ئەوەی هەیە بە زمانی خۆی فێری تەکنەلۆژیای هەرە نوێ ببێت. Kurdistan AI شوێنێکە کە تێیدا گەشەپێدەران، خوێندکاران، و توێژەران دەتوانن <Link to="/projects" className="text-primary hover:underline">پڕۆژەکانیان پیشان بدەن</Link>، <Link to="/qa" className="text-primary hover:underline">پرسیار بکەن</Link>، زانیاری بگوازنەوە، و پێکەوە کۆمەڵگایەکی بەهێز بنیاد بنێن.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-border bg-accent/30 py-16 md:py-20">
          <div className="container">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.h2 variants={fadeUp} className="mb-10 text-center text-2xl font-bold text-foreground">
                بایەخەکانمان
              </motion.h2>
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
                {values.map((value) => (
                  <motion.div key={value.title} variants={fadeUp}>
                    <Card className="h-full border-border">
                      <CardContent className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <value.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{value.title}</h3>
                          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16 md:py-20">
          <div className="container text-center">
            <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
              ببە بەشێک لە Kurdistan AI
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80 leading-relaxed">
              تۆمار بکە و ئێستا دەست بکە بە بەشداری لە Kurdistan AI — بەخۆڕایی و بە کوردی.
            </p>
            <Button variant="secondary" size="lg" className="mt-8" asChild>
              <Link to="/signup">تۆمارکردن</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
