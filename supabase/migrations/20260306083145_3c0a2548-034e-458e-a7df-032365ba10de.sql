-- Create unique views tracking table
CREATE TABLE public.unique_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_id uuid NOT NULL,
  target_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

ALTER TABLE public.unique_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read views" ON public.unique_views FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert views" ON public.unique_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Replace the increment_view_count function to only count unique views
CREATE OR REPLACE FUNCTION public.increment_view_count(table_name text, row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  -- If no authenticated user, allow anonymous view (still increment)
  IF _user_id IS NULL THEN
    IF table_name = 'projects' THEN
      UPDATE projects SET views_count = views_count + 1 WHERE id = row_id;
    ELSIF table_name = 'questions' THEN
      UPDATE questions SET views_count = views_count + 1 WHERE id = row_id;
    ELSIF table_name = 'blog_posts' THEN
      UPDATE blog_posts SET views_count = views_count + 1 WHERE id = row_id;
    END IF;
    RETURN;
  END IF;

  -- Try to insert unique view; if already exists, do nothing
  INSERT INTO public.unique_views (user_id, target_id, target_type)
  VALUES (_user_id, row_id, table_name)
  ON CONFLICT (user_id, target_id, target_type) DO NOTHING;

  -- Only increment if we actually inserted (new view)
  IF FOUND THEN
    IF table_name = 'projects' THEN
      UPDATE projects SET views_count = views_count + 1 WHERE id = row_id;
    ELSIF table_name = 'questions' THEN
      UPDATE questions SET views_count = views_count + 1 WHERE id = row_id;
    ELSIF table_name = 'blog_posts' THEN
      UPDATE blog_posts SET views_count = views_count + 1 WHERE id = row_id;
    END IF;
  END IF;
END;
$function$;