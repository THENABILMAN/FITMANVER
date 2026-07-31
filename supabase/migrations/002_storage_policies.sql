-- Storage buckets (run in Supabase dashboard SQL editor after creating buckets)
-- Note: Bucket creation is typically done via Supabase Dashboard > Storage

-- Example storage policies (adjust bucket names as needed):
-- CREATE POLICY "Users upload own avatars" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users read own avatars" ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
