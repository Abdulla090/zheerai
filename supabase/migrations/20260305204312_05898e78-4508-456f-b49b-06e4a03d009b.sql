
-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create posts" ON blog_posts;

-- Allow authenticated users to insert blog posts (they set published=false, admin sets true)
CREATE POLICY "Authenticated users can create posts"
ON blog_posts FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND author_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- Drop existing update policy
DROP POLICY IF EXISTS "Authors can update own posts" ON blog_posts;

-- Authors can update their own unpublished posts (not the published flag)
CREATE POLICY "Authors can update own posts"
ON blog_posts FOR UPDATE TO authenticated
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = blog_posts.author_id)
);

-- Admins can update any post (to approve/publish)
CREATE POLICY "Admins can update any post"
ON blog_posts FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Drop existing select policy and recreate to also let authors see their own unpublished
DROP POLICY IF EXISTS "Published posts viewable by everyone" ON blog_posts;

CREATE POLICY "Published posts or own posts viewable"
ON blog_posts FOR SELECT
USING (
  published = true
  OR auth.uid() = (SELECT user_id FROM profiles WHERE id = blog_posts.author_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- Admins can delete posts
CREATE POLICY "Admins can delete posts"
ON blog_posts FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);
