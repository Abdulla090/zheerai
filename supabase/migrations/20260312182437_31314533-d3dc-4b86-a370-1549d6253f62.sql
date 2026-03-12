
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System inserts via triggers (security definer), users can't insert
-- Users can update their own (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Function to notify all users about new content (questions, projects, blogs)
CREATE OR REPLACE FUNCTION public.notify_new_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _author_name text;
  _content_type text;
  _content_title text;
  _link text;
  _author_user_id uuid;
BEGIN
  -- Determine content type and build link
  IF TG_TABLE_NAME = 'questions' THEN
    _content_type := 'new_question';
    _content_title := NEW.title;
    _link := '/qa/' || NEW.id;
  ELSIF TG_TABLE_NAME = 'projects' THEN
    _content_type := 'new_project';
    _content_title := NEW.title;
    _link := '/projects/' || NEW.id;
  ELSIF TG_TABLE_NAME = 'blog_posts' THEN
    -- Only notify for published posts
    IF NEW.published = false THEN
      RETURN NEW;
    END IF;
    _content_type := 'new_blog';
    _content_title := NEW.title;
    _link := '/blog/' || NEW.id;
  END IF;

  -- Get author info
  SELECT display_name, user_id INTO _author_name, _author_user_id
  FROM public.profiles
  WHERE id = NEW.author_id;

  -- Notify all users except the author
  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  SELECT 
    p.user_id,
    _content_type,
    _content_title,
    _author_name,
    _link,
    jsonb_build_object('author_id', NEW.author_id, 'content_id', NEW.id)
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL 
    AND p.user_id != COALESCE(_author_user_id, '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN NEW;
END;
$$;

-- Function to notify content owner about new comments
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _commenter_name text;
  _commenter_user_id uuid;
  _owner_user_id uuid;
  _content_title text;
  _link text;
BEGIN
  -- Get commenter info
  SELECT display_name, user_id INTO _commenter_name, _commenter_user_id
  FROM public.profiles
  WHERE id = NEW.author_id;

  -- Find content owner and build link based on target_type
  IF NEW.target_type = 'question' THEN
    SELECT p.user_id, q.title INTO _owner_user_id, _content_title
    FROM public.questions q
    JOIN public.profiles p ON p.id = q.author_id
    WHERE q.id = NEW.target_id;
    _link := '/qa/' || NEW.target_id;
  ELSIF NEW.target_type = 'project' THEN
    SELECT p.user_id, pr.title INTO _owner_user_id, _content_title
    FROM public.projects pr
    JOIN public.profiles p ON p.id = pr.author_id
    WHERE pr.id = NEW.target_id;
    _link := '/projects/' || NEW.target_id;
  ELSIF NEW.target_type = 'blog_post' THEN
    SELECT p.user_id, bp.title INTO _owner_user_id, _content_title
    FROM public.blog_posts bp
    JOIN public.profiles p ON p.id = bp.author_id
    WHERE bp.id = NEW.target_id;
    _link := '/blog/' || NEW.target_id;
  END IF;

  -- Don't notify if commenting on own content or owner not found
  IF _owner_user_id IS NULL OR _owner_user_id = _commenter_user_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  VALUES (
    _owner_user_id,
    'new_comment',
    _content_title,
    _commenter_name,
    _link,
    jsonb_build_object('commenter_id', NEW.author_id, 'comment_id', NEW.id, 'target_type', NEW.target_type)
  );

  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_new_question_notify
AFTER INSERT ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.notify_new_content();

CREATE TRIGGER on_new_project_notify
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.notify_new_content();

CREATE TRIGGER on_new_blog_notify
AFTER INSERT ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.notify_new_content();

CREATE TRIGGER on_new_comment_notify
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();
