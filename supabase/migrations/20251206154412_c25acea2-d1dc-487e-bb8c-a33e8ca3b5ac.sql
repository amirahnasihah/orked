-- Add reviews column to kedai_makan_demo
ALTER TABLE public.kedai_makan_demo 
ADD COLUMN reviews JSONB DEFAULT '[]'::jsonb;

-- Update existing kedai with sample reviews
UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Ahmad", "rating": 5, "text": "Sedap gila boss! Ayam crispy confirm best"},
  {"name": "Sarah", "rating": 4, "text": "Queue panjang tapi berbaloi la"},
  {"name": "Muthu", "rating": 5, "text": "My go-to place every weekend!"}
]'::jsonb WHERE name = 'Village Park Restaurant';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Faizal", "rating": 5, "text": "Roti canai paling crispy area SS2"},
  {"name": "Jenny", "rating": 4, "text": "Late night mamak terbaik!"},
  {"name": "Kumar", "rating": 5, "text": "Milo ais dia power"}
]'::jsonb WHERE name = 'Restoran Murni Discovery';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Ah Kow", "rating": 5, "text": "Curry mee legend! Must try la"},
  {"name": "David", "rating": 4, "text": "Spicy level confirm kick"},
  {"name": "Ming", "rating": 5, "text": "Been coming here 10 years already"}
]'::jsonb WHERE name = 'Ah Heng Curry Chicken Bee Hoon';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Aisha", "rating": 5, "text": "Sotong celup tepung crispy gila!"},
  {"name": "Hafiz", "rating": 4, "text": "Nasi lemak dia sedap, portion besar"},
  {"name": "Nurul", "rating": 5, "text": "Best breakfast spot in Bangsar"}
]'::jsonb WHERE name = 'Restoran Syed Bistro';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Uncle Tan", "rating": 5, "text": "Roti babi legendary since 1928!"},
  {"name": "Michael", "rating": 5, "text": "Heritage food at its finest"},
  {"name": "Wei Lin", "rating": 4, "text": "Must try their marble cake too"}
]'::jsonb WHERE name = 'Restoran Yut Kee';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Rahim", "rating": 4, "text": "24 hours nasi kandar, memang legend"},
  {"name": "Siti", "rating": 5, "text": "Ayam madu dia terbaik!"},
  {"name": "Ali", "rating": 4, "text": "Portion besar, harga okay"}
]'::jsonb WHERE name = 'Nasi Kandar Pelita';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Mei Ling", "rating": 5, "text": "Tom yum dia authentic Thai taste"},
  {"name": "Aishah", "rating": 4, "text": "Halal Thai food best area SS2"},
  {"name": "Tan", "rating": 5, "text": "Pad thai sedap gila"}
]'::jsonb WHERE name = 'Pork Free Thai Seafood';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Ah Beng", "rating": 5, "text": "BKT paling sedap area PJ!"},
  {"name": "Steven", "rating": 5, "text": "Herbal soup confirm power"},
  {"name": "Kenny", "rating": 4, "text": "You tiao dia crispy"}
]'::jsonb WHERE name = 'Restaurant Good Taste Bak Kut Teh';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Zainab", "rating": 5, "text": "Nasi lemak udang sambal terbaik!"},
  {"name": "Fadzil", "rating": 4, "text": "Penang food in Bangsar, shiok"},
  {"name": "Linda", "rating": 5, "text": "Char kuey teow dia best"}
]'::jsonb WHERE name = 'Warung Penang';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Ah Chong", "rating": 5, "text": "Dim sum terbaik KL!"},
  {"name": "Richard", "rating": 4, "text": "Char siu bao fluffy gila"},
  {"name": "Danny", "rating": 5, "text": "Weekend family breakfast here"}
]'::jsonb WHERE name = 'Imbi Palace';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Raj", "rating": 5, "text": "Maggi goreng double special!"},
  {"name": "Priya", "rating": 4, "text": "Best mamak vibes in Bangsar"},
  {"name": "Azman", "rating": 5, "text": "Teh tarik dia confirm best"}
]'::jsonb WHERE name = 'Devi''s Corner';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Mak Cik Kiah", "rating": 5, "text": "Sambal dia sedap macam rumah"},
  {"name": "Pak Abu", "rating": 5, "text": "Queue panjang tapi berbaloi"},
  {"name": "Aminah", "rating": 4, "text": "Nasi lemak original taste"}
]'::jsonb WHERE name = 'Nasi Lemak Tanglin';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Ah Huat", "rating": 5, "text": "Wan tan mee springy gila"},
  {"name": "Eric", "rating": 4, "text": "Char siu dia power"},
  {"name": "Philip", "rating": 5, "text": "Best noodles in Damansara"}
]'::jsonb WHERE name = 'Restoran Seong Hee';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Diana", "rating": 5, "text": "Upscale Malaysian food, worth it"},
  {"name": "Kelvin", "rating": 4, "text": "Nasi bojari terbaik!"},
  {"name": "Amanda", "rating": 5, "text": "Perfect for family dinner"}
]'::jsonb WHERE name = 'Madam Kwan''s';

UPDATE public.kedai_makan_demo SET reviews = '[
  {"name": "Jason", "rating": 5, "text": "Butter crab legendary!"},
  {"name": "Andy", "rating": 5, "text": "Portion besar, seafood fresh"},
  {"name": "Raymond", "rating": 4, "text": "Must book in advance"}
]'::jsonb WHERE name = 'Fatty Crab';