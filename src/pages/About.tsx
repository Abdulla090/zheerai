import { motion } from "framer-motion";
import { ExternalLink, Users, BookOpen, Cpu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import zheerSazLogo from "@/assets/zheer-saz-logo.jpg";
import kurdistanAiLogo from "@/assets/kurdistan-ai-logo.jpg";

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
    logo: zheerSazLogo,
    telegram: "https://t.me/zheer_saz",
    description:
      "ژیرساز گرووپێکی تایبەتمەندە لە بواری زیرەکی دەستکرد و تەکنەلۆژیا، کە ئامانجی بەهێزکردنی کۆمەڵگای کوردی تەکنەلۆژییە لەڕێگەی فێرکاری، پڕۆژە، و ناوەڕۆکی بەسوودەوە.",
  },
  {
    name: "Kurdistan AI",
    logo: kurdistanAiLogo,
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

const About = () => {
  return (
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
              دەربارەی <span className="text-primary">ZHEERAI</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
              ZHEERAI پلاتفۆرمێکی یەکگرتووە کە لەلایەن دوو ڕێکخراوی پێشەنگەوە دامەزراوە، بۆ ئەوەی کۆمەڵگای کوردی بتوانێت بە زمانی خۆی فێری زیرەکی دەستکرد ببێت، زانیاری بدات و وەربگرێت — بەتەواوی بەخۆڕایی.
            </p>
          </motion.div>
        </div>
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Organizations */}
      <section className="py-16 md:py-20">
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
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="h-full w-full object-cover"
                        />
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
      <section className="border-y border-border bg-accent/30 py-16 md:py-20">
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
              ئێمە باوەڕمان وایە هەموو کوردێک مافی ئەوەی هەیە بە زمانی خۆی فێری تەکنەلۆژیای هەرە نوێ ببێت. ZHEERAI شوێنێکە کە تێیدا گەشەپێدەران، خوێندکاران، و توێژەران دەتوانن پڕۆژەکانیان پیشان بدەن، پرسیار بکەن، زانیاری بگوازنەوە، و پێکەوە کۆمەڵگایەکی بەهێز بنیاد بنێن — بەدوور لە هەر کۆسپ و بەرگرییەک.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
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
            ببە بەشێک لە کۆمەڵگاکە
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80 leading-relaxed">
            تۆمار بکە و ئێستا دەست بکە بە بەشداری لە ZHEERAI — بەخۆڕایی و بە کوردی.
          </p>
          <Button variant="secondary" size="lg" className="mt-8" asChild>
            <a href="/signup">تۆمارکردن</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
