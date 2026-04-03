import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Layout from "@/components/layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";

// Lazy load non-critical routes
const Blog = lazy(() => import("./pages/Blog"));
const NewBlogPost = lazy(() => import("./pages/NewBlogPost"));
const BlogPostDetail = lazy(() => import("./pages/BlogPostDetail"));
const EditBlogPost = lazy(() => import("./pages/EditBlogPost"));
const AdminBlogApproval = lazy(() => import("./pages/AdminBlogApproval"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const About = lazy(() => import("./pages/About"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min
      gcTime: 1000 * 60 * 10, // 10 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Layout>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/new" element={<NewProject />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/projects/:id/edit" element={<EditProject />} />
                  <Route path="/qa" element={<QA />} />
                  <Route path="/qa/new" element={<NewQuestion />} />
                  <Route path="/qa/:id" element={<QuestionDetail />} />
                  <Route path="/qa/:id/edit" element={<EditQuestion />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/new" element={<NewBlogPost />} />
                  <Route path="/blog/:id" element={<BlogPostDetail />} />
                  <Route path="/blog/:id/edit" element={<EditBlogPost />} />
                  <Route path="/admin/blog-approval" element={<AdminBlogApproval />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="/user/:id" element={<UserProfile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
