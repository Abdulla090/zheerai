
-- Create a function to increment views that bypasses RLS
CREATE OR REPLACE FUNCTION public.increment_view_count(table_name text, row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF table_name = 'projects' THEN
    UPDATE projects SET views_count = views_count + 1 WHERE id = row_id;
  ELSIF table_name = 'questions' THEN
    UPDATE questions SET views_count = views_count + 1 WHERE id = row_id;
  ELSIF table_name = 'blog_posts' THEN
    UPDATE blog_posts SET views_count = views_count + 1 WHERE id = row_id;
  END IF;
END;
$$;
