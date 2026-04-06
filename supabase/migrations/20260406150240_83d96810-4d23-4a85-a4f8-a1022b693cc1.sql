
CREATE TABLE public.tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  body text,
  video_url text,
  video_type text CHECK (video_type IN ('youtube', 'google_drive', 'none')),
  thumbnail_url text,
  tags text[] DEFAULT '{}'::text[],
  views_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  author_id uuid REFERENCES public.profiles(id),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- Everyone can view published tutorials
CREATE POLICY "Published tutorials viewable by everyone"
ON public.tutorials FOR SELECT
USING (published = true OR auth.uid() = (SELECT user_id FROM profiles WHERE id = tutorials.author_id) OR has_role(auth.uid(), 'admin'));

-- Only admins can create tutorials
CREATE POLICY "Admins can create tutorials"
ON public.tutorials FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update tutorials
CREATE POLICY "Admins can update tutorials"
ON public.tutorials FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete tutorials
CREATE POLICY "Admins can delete tutorials"
ON public.tutorials FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
