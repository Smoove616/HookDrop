-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to view available hooks" ON hooks;
DROP POLICY IF EXISTS "Allow users to view own hooks" ON hooks;
DROP POLICY IF EXISTS "Allow authenticated users to insert hooks" ON hooks;
DROP POLICY IF EXISTS "Allow users to update own hooks" ON hooks;
DROP POLICY IF EXISTS "Allow users to delete own hooks" ON hooks;

-- Create comprehensive RLS policies
CREATE POLICY "Public can view available hooks"
ON hooks FOR SELECT
USING (is_available = true);

CREATE POLICY "Users can view own hooks"
ON hooks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hooks"
ON hooks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hooks"
ON hooks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hooks"
ON hooks FOR DELETE
USING (auth.uid() = user_id);
