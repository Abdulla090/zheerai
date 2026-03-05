import { motion } from "framer-motion";
import { Eye, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockBlogPosts } from "@/lib/mock-data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Blog = () => {
  const featured = mockBlogPosts[0];
  const rest = mockBlogPosts.slice(1);

  return (
    <div className="py-10 md:py-14">
      <div className="container">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">بڵاوکراوەکان</h1>
          <p className="mt-2 text-sm text-muted-foreground">بابەت، فێرکاری، و هەواڵی زیرەکی دەستکرد</p>
        </div>

        {/* Featured Post */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Card className="group cursor-pointer overflow-hidden border-border transition-shadow hover:shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-video bg-accent md:aspect-auto md:min-h-[280px]" />
                <CardContent className="flex flex-col justify-center p-6 md:p-8">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {featured.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors md:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{featured.author.display_name}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {featured.created_at}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {featured.views_count.toLocaleString("ar-SA")}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Blog Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {rest.map((post) => (
            <motion.div key={post.id} variants={fadeUp}>
              <Card className="group h-full cursor-pointer border-border transition-shadow hover:shadow-md">
                <div className="aspect-[16/9] w-full bg-accent" />
                <CardContent className="p-5">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{post.author.display_name}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views_count.toLocaleString("ar-SA")}
                    </span>
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

export default Blog;
