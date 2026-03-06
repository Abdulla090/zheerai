import { motion } from "framer-motion";
import { Eye, Calendar, Plus, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useProfile";
import { containerFast, fadeUpSmall } from "@/lib/animations";
import SEOHead from "@/components/SEOHead";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();
  const { user } = useAuth();
  const { data: roles } = useUserRole();
  const isAdmin = roles?.includes("admin");
  const featured = posts?.[0];
  const rest = posts?.slice(1) ?? [];

  if (isLoading) {
    return (
      <div className="py-10 md:py-14">
        <div className="container space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="بڵاوکراوەکان"
        description="بابەت، فێرکاری، و هەواڵی زیرەکی دەستکرد بە زمانی کوردی"
        canonical="https://zheerai.lovable.app/blog"
      />
    <div className="py-10 md:py-14">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">بڵاوکراوەکان</h1>
            <p className="mt-2 text-sm text-muted-foreground">بابەت، فێرکاری، و هەواڵی زیرەکی دەستکرد</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/blog-approval"><Shield className="h-4 w-4 ml-1" />پەسەندکردن</Link>
              </Button>
            )}
            {user && (
              <Button size="sm" asChild>
                <Link to="/blog/new"><Plus className="h-4 w-4 ml-1" />نوسینی بابەت</Link>
              </Button>
            )}
          </div>
        </div>
        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
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
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors md:text-2xl">{featured.title}</h2>
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
        )}
        {rest.length > 0 && (
          <motion.div variants={containerFast} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <motion.div key={post.id} variants={fadeUpSmall}>
                <Link to={`/blog/${post.id}`}>
                  <Card className="group h-full cursor-pointer border-border transition-shadow hover:shadow-md">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="aspect-[16/9] w-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="aspect-[16/9] w-full bg-accent" />
                    )}
                    <CardContent className="p-5">
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{post.profiles?.display_name}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views_count}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        {!isLoading && posts?.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">هیچ بابەتێک نەدۆزرایەوە</div>
        )}
      </div>
    </>
  );
};

export default Blog;
