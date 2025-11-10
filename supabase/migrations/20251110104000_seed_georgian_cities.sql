INSERT INTO public.cities (
    name,
    country,
    state_province,
    center_lat,
    center_lng,
    timezone,
    population
)
VALUES
    ('Tbilisi', 'Georgia', 'Tbilisi', 41.71510000, 44.82710000, 'Asia/Tbilisi', 1187000),
    ('Kutaisi', 'Georgia', 'Imereti', 42.24960000, 42.69970000, 'Asia/Tbilisi', 147635),
    ('Telavi', 'Georgia', 'Kakheti', 41.91980000, 45.47310000, 'Asia/Tbilisi', 19629),
    ('Batumi', 'Georgia', 'Adjara', 41.61680000, 41.63670000, 'Asia/Tbilisi', 154100),
    ('Zugdidi', 'Georgia', 'Samegrelo-Zemo Svaneti', 42.50880000, 41.87090000, 'Asia/Tbilisi', 42723),
    ('Terjola', 'Georgia', 'Imereti', 42.20910000, 42.97300000, 'Asia/Tbilisi', 14825),
    ('Borjomi', 'Georgia', 'Samtskhe-Javakheti', 41.84200000, 43.39000000, 'Asia/Tbilisi', 13579),
    ('Poti', 'Georgia', 'Samegrelo-Zemo Svaneti', 42.14670000, 41.67180000, 'Asia/Tbilisi', 47940),
    ('Ambrolauri', 'Georgia', 'Racha-Lechkhumi and Kvemo Svaneti', 42.52210000, 43.16200000, 'Asia/Tbilisi', 2160),
    ('Mtskheta', 'Georgia', 'Mtskheta-Mtianeti', 41.84510000, 44.71880000, 'Asia/Tbilisi', 7938),
    ('Gori', 'Georgia', 'Shida Kartli', 41.98420000, 44.11580000, 'Asia/Tbilisi', 48700)
ON CONFLICT (name, country, state_province) DO UPDATE
SET
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng,
    timezone = EXCLUDED.timezone,
    population = EXCLUDED.population,
    is_active = TRUE;

