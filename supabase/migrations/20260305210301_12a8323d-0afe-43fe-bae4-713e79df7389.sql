
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view blog covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated users can upload blog covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own blog covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
