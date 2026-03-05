
-- Comments table for projects, questions, and blog posts
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('project', 'question', 'blog_post')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = comments.author_id));
CREATE POLICY "Authors can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = comments.author_id));

-- Likes table (polymorphic)
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('project', 'question', 'blog_post', 'answer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_id, target_type)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Add likes_count to projects, questions, blog_posts, answers
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

-- Add comments_count to projects, questions, blog_posts
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

-- Function to update likes_count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'project' THEN
      UPDATE projects SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'question' THEN
      UPDATE questions SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'blog_post' THEN
      UPDATE blog_posts SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'answer' THEN
      UPDATE answers SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'project' THEN
      UPDATE projects SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'question' THEN
      UPDATE questions SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'blog_post' THEN
      UPDATE blog_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'answer' THEN
      UPDATE answers SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- Function to update comments_count
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'project' THEN
      UPDATE projects SET comments_count = comments_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'question' THEN
      UPDATE questions SET comments_count = comments_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'blog_post' THEN
      UPDATE blog_posts SET comments_count = comments_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'project' THEN
      UPDATE projects SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'question' THEN
      UPDATE questions SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'blog_post' THEN
      UPDATE blog_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();
