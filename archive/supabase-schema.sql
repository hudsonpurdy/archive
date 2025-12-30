-- Archive Clothing Items Table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Owner
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Basic Information
  brand TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT, -- e.g., 'jacket', 'pants', 'shirt', 'shoes'
  season TEXT, -- e.g., 'FW2023', 'SS2019'
  year INTEGER,

  -- Identification
  style_code TEXT, -- Product/style code
  colorway TEXT,
  size TEXT,

  -- Acquisition Details
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  purchase_location TEXT,
  condition TEXT, -- e.g., 'new', 'used-excellent', 'used-good', 'vintage'

  -- Additional Details
  description TEXT,
  notes TEXT,
  tags TEXT[], -- Array of tags for flexible categorization

  -- Collection Management
  is_for_sale BOOLEAN DEFAULT FALSE,
  asking_price DECIMAL(10, 2),
  location TEXT -- Where the item is stored
);

-- Create indexes for faster queries
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_brand ON items(brand);
CREATE INDEX idx_items_category ON items(category);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can view, only owners can modify
-- Allow everyone (including anonymous users) to view all items
CREATE POLICY "Anyone can view all items" ON items
  FOR SELECT USING (true);

-- Only authenticated users can insert their own items
CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only owners can update their own items
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- Only owners can delete their own items
CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Images Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Relationships
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  -- Image Details
  url TEXT NOT NULL, -- Path to image in Supabase Storage
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0, -- For custom sorting

  -- Optional Metadata
  alt_text TEXT,
  file_size INTEGER, -- Size in bytes
  width INTEGER,
  height INTEGER
);

-- Create indexes for faster queries
CREATE INDEX idx_images_item_id ON images(item_id);
CREATE INDEX idx_images_is_primary ON images(item_id, is_primary);

-- Enable Row Level Security (RLS)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can view, only item owners can modify
-- Allow everyone to view all images
CREATE POLICY "Anyone can view all images" ON images
  FOR SELECT USING (true);

-- Only item owners can insert images for their items
CREATE POLICY "Item owners can insert images" ON images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = images.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Only item owners can update images
CREATE POLICY "Item owners can update images" ON images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = images.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Only item owners can delete images
CREATE POLICY "Item owners can delete images" ON images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = images.item_id
      AND items.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Test Data (Optional - run after creating tables)
-- ============================================================================
-- NOTE: Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users
-- You can find your user ID by running: SELECT id FROM auth.users;

/*
-- Sample Items
INSERT INTO items (user_id, brand, item_name, category, season, year, colorway, size, condition, description, tags, is_for_sale, asking_price)
VALUES
  ('YOUR_USER_ID_HERE', 'Raf Simons', 'Virginia Creeper Bomber', 'jacket', 'FW2001', 2001, 'Black/Green', 'M', 'used-excellent', 'Iconic Virginia Creeper print bomber jacket from Raf Simons FW2001 Riot Riot Riot collection', ARRAY['raf simons', 'grail', 'fw2001'], false, null),

  ('YOUR_USER_ID_HERE', 'Helmut Lang', 'Painter Jeans', 'pants', 'FW1999', 1999, 'Indigo', '32', 'used-good', 'Classic Helmut Lang painter jeans with paint splatter detail', ARRAY['helmut lang', 'archive', 'denim'], true, 450.00),

  ('YOUR_USER_ID_HERE', 'Maison Martin Margiela', 'Replica GAT Sneakers', 'shoes', 'SS2002', 2002, 'White/Grey', '43', 'used-excellent', 'Original Margiela Replica German Army Trainer sneakers', ARRAY['margiela', 'gats', 'sneakers'], false, null),

  ('YOUR_USER_ID_HERE', 'Number (N)ine', 'Kurt Cobain Denim Jacket', 'jacket', 'SS2003', 2003, 'Light Wash', 'L', 'vintage', 'Rare Number Nine Kurt Cobain tribute denim jacket', ARRAY['number nine', 'grail', 'takahiro miyashita', 'kurt cobain'], true, 2500.00),

  ('YOUR_USER_ID_HERE', 'Undercover', 'Scab Tee', 'shirt', 'SS2006', 2006, 'Black', 'M', 'used-good', 'Paper Doll collection scab print t-shirt', ARRAY['undercover', 'jun takahashi', 'paper doll'], false, null);

-- Sample Images (using placeholder URLs - replace with actual Supabase Storage URLs)
-- Get the item IDs first, then insert images
INSERT INTO images (item_id, url, is_primary, display_order, alt_text)
SELECT
  i.id,
  'items/' || i.id || '/primary.jpg',
  true,
  1,
  i.brand || ' ' || i.item_name || ' - Front View'
FROM items i
WHERE i.user_id = 'YOUR_USER_ID_HERE';
*/
