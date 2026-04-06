
-- 1. Fix user_roles: add restrictive INSERT policy blocking non-admins
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. Fix app_settings: restrict SELECT to admins only (protects VAPID private key)
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Only admins can read settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 3. Fix project-images bucket: ownership-based policies
-- Update INSERT to require file path starts with user's ID
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
CREATE POLICY "Users can upload own project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add UPDATE policy scoped to owner
CREATE POLICY "Users can update own project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add DELETE policy scoped to owner
CREATE POLICY "Users can delete own project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);
