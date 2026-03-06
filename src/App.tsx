import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import EditProject from "./pages/EditProject";
import QA from "./pages/QA";
import NewQuestion from "./pages/NewQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import EditQuestion from "./pages/EditQuestion";
import Blog from "./pages/Blog";
import NewBlogPost from "./pages/NewBlogPost";
import BlogPostDetail from "./pages/BlogPostDetail";
import EditBlogPost from "./pages/EditBlogPost";
import AdminBlogApproval from "./pages/AdminBlogApproval";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
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
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
