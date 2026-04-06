
-- 1. Fix author_id spoofing: enforce author_id matches authenticated user's profile

-- Questions
DROP POLICY IF EXISTS "Authenticated users can create questions" ON public.questions;
CREATE POLICY "Authenticated users can create questions"
ON public.questions FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- Answers
DROP POLICY IF EXISTS "Authenticated users can create answers" ON public.answers;
CREATE POLICY "Authenticated users can create answers"
ON public.answers FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- Comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- Projects
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects"
ON public.projects FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- 2. Fix user_roles: restrict SELECT to own roles only (has_role function is SECURITY DEFINER so bypasses RLS)
DROP POLICY IF EXISTS "Roles viewable by everyone" ON public.user_roles;
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Fix blog-covers INSERT: enforce path ownership
DROP POLICY IF EXISTS "Authenticated users can upload blog covers" ON storage.objects;
CREATE POLICY "Users can upload own blog covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-covers'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Also add UPDATE policy for blog-covers scoped to owner
CREATE POLICY "Users can update own blog covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-covers'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
