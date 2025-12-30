-- Storage Bucket Setup for Item Images
-- IMPORTANT: Do NOT run this in the SQL Editor!
-- Instead, follow the instructions below to set up storage using the Supabase Dashboard UI.

-- ============================================================================
-- SETUP INSTRUCTIONS - Use the Supabase Dashboard
-- ============================================================================

-- Step 1: Create the Storage Bucket
-- -----------------------------------
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "Create a new bucket"
-- 3. Set the following:
--    - Name: item-images
--    - Public bucket: YES (toggle ON)
--    - File size limit: 5242880 (5MB)
-- 4. Click "Create bucket"

-- Step 2: Set Up Storage Policies
-- -----------------------------------
-- After creating the bucket, you need to set up RLS policies.
-- Click on the "item-images" bucket, then go to "Policies" tab.

-- Policy 1: SELECT (Anyone can view)
-- Click "New Policy" > Select "For full customization" and use this SQL:
-- IMPORTANT: Remove "TO public" - the UI adds it automatically
/*
CREATE POLICY "Anyone can view item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');
*/

-- Policy 2: INSERT (Authenticated users can upload to their own folder)
-- Click "New Policy" > Select "For full customization" and use this SQL:
-- IMPORTANT: Remove "TO authenticated" - the UI adds it automatically
/*
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'item-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- Policy 3: UPDATE (Users can update their own images)
-- Click "New Policy" > Select "For full customization" and use this SQL:
-- IMPORTANT: Remove "TO authenticated" - the UI adds it automatically
/*
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'item-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- Policy 4: DELETE (Users can delete their own images)
-- Click "New Policy" > Select "For full customization" and use this SQL:
-- IMPORTANT: Remove "TO authenticated" - the UI adds it automatically
/*
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'item-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- ============================================================================
-- Alternative: Quick Setup (if policies tab doesn't work)
-- ============================================================================
-- If the policies tab doesn't work, you can create policies from the SQL Editor
-- by using DO blocks with proper permissions:

-- UNCOMMENT AND RUN THIS SECTION IF THE ABOVE DOESN'T WORK:
/*
DO $$
BEGIN
  -- Create bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('item-images', 'item-images', true, 5242880)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;
*/

-- Note: If RLS policies still fail, you may need to contact Supabase support
-- or use the Supabase Dashboard UI to create policies manually.
