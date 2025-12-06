-- Create kedai_makan_demo table
CREATE TABLE public.kedai_makan_demo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lon DECIMAL(11, 8) NOT NULL,
  price_level TEXT NOT NULL CHECK (price_level IN ('$', '$$', '$$$')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  signature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read
ALTER TABLE public.kedai_makan_demo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kedai" 
ON public.kedai_makan_demo 
FOR SELECT 
USING (true);

-- Insert demo data
INSERT INTO public.kedai_makan_demo (name, area, lat, lon, price_level, tags, signature) VALUES
('Village Park Restaurant', 'Damansara', 3.1347, 101.6256, '$$', ARRAY['nasi lemak', 'halal', 'famous'], 'Nasi Lemak Ayam Goreng'),
('Restoran Murni Discovery', 'SS2', 3.1167, 101.6167, '$', ARRAY['mamak', 'halal', 'late night'], 'Roti Canai Telur Bawang'),
('Ah Heng Curry Chicken Bee Hoon', 'PJ', 3.1041, 101.6410, '$', ARRAY['pork', 'chinese', 'spicy'], 'Curry Mee with Pork Blood'),
('Restoran Syed Bistro', 'Bangsar', 3.1300, 101.6714, '$$', ARRAY['mamak', 'halal', 'nasi lemak'], 'Nasi Lemak Sotong Celup Tepung'),
('Restoran Yut Kee', 'KL', 3.1540, 101.6956, '$$', ARRAY['hainanese', 'pork', 'heritage'], 'Roti Babi'),
('Nasi Kandar Pelita', 'Damansara', 3.1280, 101.6300, '$', ARRAY['mamak', 'halal', 'nasi kandar'], 'Nasi Kandar Campur'),
('Pork Free Thai Seafood', 'SS2', 3.1150, 101.6200, '$$', ARRAY['thai', 'halal', 'spicy'], 'Tom Yum Seafood'),
('Restaurant Good Taste Bak Kut Teh', 'PJ', 3.0980, 101.6350, '$$', ARRAY['pork', 'chinese', 'herbal'], 'Bak Kut Teh'),
('Warung Penang', 'Bangsar', 3.1285, 101.6700, '$', ARRAY['penang', 'halal', 'nasi lemak'], 'Nasi Lemak Udang Sambal'),
('Imbi Palace', 'KL', 3.1420, 101.7115, '$$$', ARRAY['dim sum', 'chinese', 'pork'], 'Char Siu Bao'),
('Devi''s Corner', 'Bangsar', 3.1295, 101.6708, '$', ARRAY['mamak', 'halal', 'roti'], 'Maggi Goreng Special'),
('Nasi Lemak Tanglin', 'KL', 3.1480, 101.6870, '$', ARRAY['nasi lemak', 'halal', 'traditional'], 'Nasi Lemak Telur Goreng'),
('Restoran Seong Hee', 'Damansara', 3.1320, 101.6240, '$$', ARRAY['chinese', 'pork', 'noodles'], 'Wan Tan Mee'),
('Madam Kwan''s', 'KL', 3.1580, 101.7120, '$$$', ARRAY['malaysian', 'halal', 'fusion'], 'Nasi Lemak Ayam Berempah'),
('Fatty Crab', 'PJ', 3.1100, 101.6380, '$$$', ARRAY['seafood', 'pork', 'spicy'], 'Butter Crab');