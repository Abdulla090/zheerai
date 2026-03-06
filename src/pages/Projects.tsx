import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { containerFast, fadeUpSmall } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";

const projectCategories = [
  { value: "ai_website", label: "ماڵپەڕی AI" },
  { value: "ai_mobile_app", label: "ئەپی مۆبایلی AI" },
  { value: "ai_tool", label: "ئامرازی AI" },
  { value: "ai_solution", label: "چارەسەری AI" },
  { value: "other", label: "هیتر" },
];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data: projects, isLoading } = useProjects(activeCategory);
  const { user } = useAuth();

  return (
    <>
      <SEOHead
        title="پڕۆژەکان"
        description="پڕۆژەکانی زیرەکی دەستکرد لە کوردستان — ماڵپەڕ، ئەپ، ئامراز و چارەسەری AI"
        canonical="https://zheerai.lovable.app/projects"
      />
    <div className="py-10 md:py-14">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">پڕۆژەکان</h1>
            <p className="mt-2 text-sm text-muted-foreground">پڕۆژەکانی زیرەکی دەستکرد لە کوردستان</p>
          </div>
          {user && (
            <Button asChild>
              <Link to="/projects/new"><Plus className="h-4 w-4 ml-2" />پڕۆژەی نوێ</Link>
            </Button>
          )}
        </div>
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button variant={activeCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveCategory("all")}>هەموو</Button>
          {projectCategories.map((cat) => (
            <Button key={cat.value} variant={activeCategory === cat.value ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat.value)}>{cat.label}</Button>
          ))}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div variants={containerFast} initial="hidden" animate="show" key={activeCategory} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <motion.div key={project.id} variants={fadeUpSmall}>
                <Link to={`/projects/${project.id}`}>
                  <Card className="group h-full cursor-pointer border-border transition-shadow hover:shadow-md">
                    {project.thumbnail_url ? (
                      <img src={project.thumbnail_url} alt={project.title} className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="aspect-video w-full bg-accent" />
                    )}
                    <CardContent className="p-5">
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {projectCategories.find(c => c.value === project.category)?.label || project.category}
                        </span>
                        {project.tags?.map((tag) => (
                          <span key={tag} className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">{project.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{project.profiles?.display_name}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{project.views_count}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        {!isLoading && projects?.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">هیچ پڕۆژەیەک نەدۆزرایەوە</div>
        )}
      </div>
    </div>
  );
};

export default Projects;
