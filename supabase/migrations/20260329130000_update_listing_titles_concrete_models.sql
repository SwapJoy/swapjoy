-- Assign concrete brand + model style titles to all items (demo / seeded listings).
-- Deterministic per row: same item id always maps to the same title variant.
-- Safe to re-run: overwrites title + updated_at only.

UPDATE public.items i
SET
  title = LEFT(x.new_title, 255),
  updated_at = now()
FROM (
  SELECT
    i2.id,
    CASE
      -- Guitars / bass
      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%guitar%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%bass%'
        OR LOWER(COALESCE(c.slug, '')) LIKE '%guitar%'
      THEN
        (ARRAY[
          'ESP LTD EC-256',
          'Fender Player Stratocaster HSS',
          'Gibson Les Paul Standard 60s',
          'Ibanez RG550 Genesis',
          'PRS SE Custom 24',
          'Schecter Hellraiser C-1',
          'Squier Classic Vibe 60s Telecaster',
          'Yamaha Pacifica 612VIIFM'
        ])[1 + (abs(hashtext(i2.id::text)) % 8)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%piano%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%keyboard%'
        OR (LOWER(COALESCE(c.title_en, '')) LIKE '%synthesizer%')
      THEN
        (ARRAY[
          'Yamaha P-225 Digital Piano',
          'Roland FP-30X',
          'Korg Krome EX 61',
          'Casio CT-S1 61-Key',
          'Nord Stage 4 Compact'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%drum%'
      THEN
        (ARRAY[
          'Pearl Export EXX 5-Piece',
          'Tama Imperialstar 22"',
          'Roland TD-17KVX V-Drums',
          'Yamaha DTX6K-X',
          'DW Design Series Acrylic'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%phone%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%smartphone%'
        OR LOWER(COALESCE(c.slug, '')) LIKE '%teleponi%'
        OR LOWER(COALESCE(c.slug, '')) LIKE '%mobile%'
      THEN
        (ARRAY[
          'Apple iPhone 15 Pro Max 256GB',
          'Apple iPhone 14 Pro 128GB',
          'Samsung Galaxy S24 Ultra',
          'Google Pixel 8 Pro',
          'OnePlus 12 256GB',
          'Xiaomi 14 Ultra',
          'Nothing Phone (2a)'
        ])[1 + (abs(hashtext(i2.id::text)) % 7)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%laptop%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%notebook%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%macbook%'
      THEN
        (ARRAY[
          'Apple MacBook Pro 14" M3 Pro',
          'Dell XPS 15 9530',
          'Lenovo ThinkPad X1 Carbon Gen 11',
          'HP Spectre x360 14',
          'ASUS ROG Zephyrus G14 (2024)',
          'Microsoft Surface Laptop Studio 2'
        ])[1 + (abs(hashtext(i2.id::text)) % 6)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%tablet%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%ipad%'
      THEN
        (ARRAY[
          'Apple iPad Pro 12.9" M2',
          'Samsung Galaxy Tab S9 Ultra',
          'Microsoft Surface Pro 9',
          'Lenovo Tab P12 Pro',
          'iPad Air (5th gen) 256GB'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%camera%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%photo%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%dslr%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%mirrorless%'
      THEN
        (ARRAY[
          'Sony Alpha 7 IV Kit',
          'Canon EOS R6 Mark II',
          'Nikon Z6 III',
          'Fujifilm X-T5',
          'GoPro HERO12 Black',
          'DJI Osmo Pocket 3'
        ])[1 + (abs(hashtext(i2.id::text)) % 6)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%headphone%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%earphone%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%earbuds%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%headset%'
      THEN
        (ARRAY[
          'Sony WH-1000XM5',
          'Apple AirPods Pro (2nd gen)',
          'Bose QuietComfort Ultra',
          'Sennheiser HD 660S2',
          'Beyerdynamic DT 900 Pro X'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%bike%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%bicycle%'
      THEN
        (ARRAY[
          'Trek Marlin 7 Gen 3',
          'Specialized Rockhopper Comp',
          'Giant Talon 2',
          'Cannondale Topstone 3',
          'Canyon Grail CF SL 7'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%motorcycle%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%scooter%'
      THEN
        (ARRAY[
          'Honda CB650R',
          'Yamaha MT-07',
          'Kawasaki Ninja 650',
          'Vespa Primavera 150',
          'BMW C 400 GT'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%fitness%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%gym%'
      THEN
        (ARRAY[
          'Bowflex SelectTech 552i Dumbbells',
          'TRX Pro4 Suspension Trainer',
          'Concept2 RowErg',
          'Peloton Bike+',
          'Rogue Ohio Bar + Bumper Set'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%football%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%soccer%'
        OR (LOWER(COALESCE(c.title_en, '')) LIKE '%sport%' AND LOWER(COALESCE(c.title_en, '')) NOT LIKE '%transport%')
      THEN
        (ARRAY[
          'Nike Mercurial Vapor 15 Elite FG',
          'Adidas Predator Accuracy.1',
          'Wilson Pro Staff 97 v14',
          'Yonex Astrox 88D Pro',
          'Bauer Vapor Hyperlite Skates'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%footwear%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%sneaker%'
        OR LOWER(COALESCE(c.slug, '')) LIKE '%pekhsatsmeli%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%shoe%'
      THEN
        (ARRAY[
          'Nike Air Max 270',
          'Nike Air Max 90',
          'Adidas Ultraboost Light',
          'New Balance 990v6',
          'ASICS Gel-Kayano 30',
          'Salomon XT-6',
          'Jordan 1 Retro High OG'
        ])[1 + (abs(hashtext(i2.id::text)) % 7)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%clothing%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%fashion%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%jacket%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%coat%'
        OR LOWER(COALESCE(c.slug, '')) LIKE '%tansatsmeli%'
      THEN
        (ARRAY[
          'Levi''s Trucker Jacket 72334-0133',
          'Patagonia Nano Puff Hoody',
          'Arc''teryx Atom LT Hoody',
          'Carhartt WIP Detroit Jacket',
          'The North Face 1996 Retro Nuptse'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%watch%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%timepiece%'
      THEN
        (ARRAY[
          'Apple Watch Ultra 2',
          'Apple Watch Series 9 GPS 45mm',
          'Garmin Fenix 7 Pro',
          'Casio G-Shock GW-M5610U',
          'Seiko 5 Sports SRPD55'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%furniture%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%sofa%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%chair%'
      THEN
        (ARRAY[
          'IKEA SÖDERHAMN 3-seat sofa',
          'Herman Miller Aeron (Size B)',
          'Steelcase Leap V2',
          'West Elm Andes 3-Piece Chaise',
          'Article Timber Charme Tan Sofa'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%appliance%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%kitchen%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%vacuum%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%mixer%'
      THEN
        (ARRAY[
          'KitchenAid Artisan 5-Qt Stand Mixer',
          'Dyson V15 Detect Absolute',
          'Breville Barista Express Impress',
          'Instant Pot Pro Plus 6-Qt',
          'Nespresso Vertuo Next Deluxe'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN (LOWER(COALESCE(c.title_en, '')) LIKE '%book%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%novel%')
        AND LOWER(COALESCE(c.title_en, '')) NOT LIKE '%notebook%'
        AND LOWER(COALESCE(c.title_en, '')) NOT LIKE '%macbook%'
      THEN
        (ARRAY[
          'Haruki Murakami — Kafka on the Shore (1st ed.)',
          'George Orwell — 1984 (Penguin Classics)',
          'J.K. Rowling — Harry Potter Set (Hardcover)',
          'Yuval Noah Harari — Sapiens (Hardcover)',
          'James Clear — Atomic Habits (Hardcover)'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%game%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%console%'
      THEN
        (ARRAY[
          'Sony PlayStation 5 (Disc)',
          'Microsoft Xbox Series X',
          'Nintendo Switch OLED Model',
          'Steam Deck OLED 512GB',
          'ASUS ROG Ally Z1 Extreme'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%tool%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%equipment%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%drill%'
      THEN
        (ARRAY[
          'DeWalt DCD791D2 20V Drill/Driver Kit',
          'Bosch GKS 190 Circular Saw',
          'Makita XDT16 Impact Driver',
          'Milwaukee M18 FUEL Hammer Drill',
          'Festool TS 55 F Plunge Saw'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%desktop%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%pc%'
        OR LOWER(COALESCE(c.slug, '')) LIKE '%desktop%'
      THEN
        (ARRAY[
          'HP OMEN 45L (RTX 4070)',
          'Lenovo Legion Tower 5i Gen 8',
          'Alienware Aurora R16',
          'Mac Studio M2 Ultra',
          'NZXT Player: Three (RTX 4070 Ti)'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%monitor%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%display%'
      THEN
        (ARRAY[
          'LG UltraGear 27GP850-B 27"',
          'Dell U2723QE 4K',
          'Samsung Odyssey G7 32"',
          'ASUS ProArt PA278CV',
          'Apple Studio Display'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%printer%'
      THEN
        (ARRAY[
          'Canon PIXMA G7020 MegaTank',
          'Epson EcoTank ET-2850',
          'Brother HL-L2350DW',
          'HP LaserJet M209dw'
        ])[1 + (abs(hashtext(i2.id::text)) % 4)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%tv%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%television%'
      THEN
        (ARRAY[
          'LG OLED C3 55"',
          'Samsung QN90C 65"',
          'Sony XR-65A80L',
          'TCL 6-Series 55R655'
        ])[1 + (abs(hashtext(i2.id::text)) % 4)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%beauty%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%cosmetic%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%skincare%'
      THEN
        (ARRAY[
          'La Roche-Posay Effaclar Duo+',
          'The Ordinary Niacinamide 10%',
          'Dyson Airwrap Complete Long',
          'Olaplex No.3 Hair Perfector',
          'Charlotte Tilbury Pillow Talk Set'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%children%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%toy%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%kids%'
      THEN
        (ARRAY[
          'LEGO Icons 10332 Medieval Town Square',
          'Fisher-Price Laugh & Learn Smart Stages Chair',
          'VTech KidiZoom Creator Cam',
          'Playmobil City Life Hospital',
          'Barbie Dreamhouse (2023)'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%jewelry%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%jewellery%'
      THEN
        (ARRAY[
          'Pandora Moments Snake Chain Bracelet',
          'Mejuri Bold Link Chain Necklace',
          'Cartier Love Ring (Narrow)',
          'Tiffany T Wire Bracelet',
          'Mikimoto Akoya Pearl Studs 8mm'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%car%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%auto%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%vehicle%'
      THEN
        (ARRAY[
          'BMW 330i M Sport (F30)',
          'Mercedes-Benz C220d W205',
          'Toyota RAV4 Hybrid XLE',
          'Tesla Model 3 Long Range',
          'VW Golf GTI Mk8'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      -- Housing / rent (reads like real listings, not "Apartments — 12345")
      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%apartment%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%condo%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%flat for%'
      THEN
        (ARRAY[
          'Sunny 2BR apartment — balcony, dishwasher, quiet block',
          'Cozy studio near metro — furnished, bills negotiable',
          'Top-floor 3BR — sea view, parking slot included',
          'Loft-style 1BR — exposed brick, high ceilings',
          'Family 4BR duplex — yard, pet-friendly building',
          'Modern 2BR in new build — AC, concierge, gym access',
          'Short-term 1BR sublet — all utilities, flexible dates'
        ])[1 + (abs(hashtext(i2.id::text)) % 7)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%rent%'
        OR LOWER(TRIM(COALESCE(c.title_en, ''))) = 'rent'
      THEN
        (ARRAY[
          'Private room in shared flat — students welcome',
          'Whole-house rental — garden, 2 baths, long-term OK',
          'Office / workspace by day — desk + fast Wi‑Fi',
          'Parking space + storage cage — gated, 24/7 access',
          'Cottage weekend let — fireplace, 6 sleeps',
          'Commercial unit frontage — high foot traffic corner'
        ])[1 + (abs(hashtext(i2.id::text)) % 6)]

      -- Comics & manga
      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%comic%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%manga%'
      THEN
        (ARRAY[
          'One Piece Box Set — East Blue & Baroque Works (Viz)',
          'Berserk Deluxe Edition Vol. 1 (hardcover)',
          'Batman: The Dark Knight Returns — first printing HC',
          'Attack on Titan Colossal Edition Vol. 5',
          'Marvel Omnibus: Amazing Spider-Man by Romita Sr.',
          'Saga Compendium One (Image)',
          'My Hero Academia 1–10 bundle — Japanese R-L reads',
          'Longbox lot: 80s–90s DC/Marvel — bagged & boarded'
        ])[1 + (abs(hashtext(i2.id::text)) % 8)]

      -- Home / project studio gear (interfaces, monitors, treatment)
      WHEN (LOWER(COALESCE(c.title_en, '')) LIKE '%studio%' AND LOWER(COALESCE(c.title_en, '')) LIKE '%audio%')
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%audio gear%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%recording equip%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%home studio%'
      THEN
        (ARRAY[
          'Focusrite Scarlett 18i20 (3rd Gen) + rack ears',
          'Universal Audio Apollo Twin X Duo + Heritage bundle',
          'Adam A7X pair + iso pads — light home use',
          'Rode NT1-A kit + pop filter + shock mount',
          'KRK Rokit 5 G4 pair — boxed',
          'Portable vocal booth + Kaotica Eyeball',
          'MIDI keyboard NI Komplete Kontrol S49 MK2',
          'Acoustic panels 12-pack — bass traps + clouds'
        ])[1 + (abs(hashtext(i2.id::text)) % 8)]

      -- Any musical instrument category not caught by guitar/piano/drum
      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%instrument%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%violin%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%saxophone%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%trumpet%'
      THEN
        (ARRAY[
          'Yamaha YTR-8335IIS Xeno trumpet — lacquer',
          'Buffet Crampon B12 clarinet + case',
          'Eastman VL305 violin outfit 4/4',
          'Jupiter JTS-1100SG tenor sax — recent service',
          'Pearl Export snare add-on 14×5.5 steel',
          'Hohner Special 20 harmonica set (keys C, G, A)',
          'Roland Aerophone GO AE-05',
          'Kala KA-C concert ukulele — mahogany'
        ])[1 + (abs(hashtext(i2.id::text)) % 8)]

      -- Paintings, prints, wall art (avoid matching "printer" — that branch is earlier)
      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%painting%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%prints%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%wall art%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%poster%'
        OR (LOWER(COALESCE(c.title_en, '')) LIKE '%fine art%')
      THEN
        (ARRAY[
          'Original oil on canvas — Tbilisi street scene, signed',
          'Limited lithograph 45/200 — framed museum glass',
          'Vintage Soviet film poster — linen-backed',
          'Gallery-wrapped giclée — abstract blue/gold 80×120cm',
          'Block print run — botanical set of 3',
          'Charcoal portrait study — A2, unframed',
          'Screenprint concert poster — numbered artist proof',
          'Antique map reprint — hand-tinted, wooden frame'
        ])[1 + (abs(hashtext(i2.id::text)) % 8)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%sculpture%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%figurine%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%statue%'
      THEN
        (ARRAY[
          'Bronze maquette — numbered edition 12/50',
          'Art deco spelter figure — marble base',
          'Hand-carved wooden bust — walnut',
          'Collectible anime scale figure 1/7 — boxed',
          'Stone garden sculpture — weathered granite'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%collectible%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%vintage toy%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%antique toy%'
      THEN
        (ARRAY[
          'Vintage tin robot — wind-up, Japan 1960s',
          'LEGO sealed set — Ideas NASA Apollo',
          'Dinky Supertoys delivery van — play-worn',
          'Star Wars vintage carded figure — reproduction check OK',
          'Matchbox Superfast lot ×24 — mixed condition'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      -- Broad parents (seed often picks these)
      WHEN LOWER(TRIM(COALESCE(c.title_en, ''))) = 'music'
        OR LOWER(COALESCE(c.slug, '')) IN ('musika')
      THEN
        (ARRAY[
          'Fender American Professional II Strat',
          'Yamaha HS8 Studio Monitor Pair',
          'Shure SM7B',
          'Focusrite Scarlett 2i2 (4th Gen)',
          'Korg Minilogue XD'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(TRIM(COALESCE(c.title_en, ''))) = 'technology'
        OR LOWER(COALESCE(c.slug, '')) = 'teknika'
      THEN
        (ARRAY[
          'Apple iPhone 15 Pro Max 256GB',
          'Samsung Galaxy Tab S9 Ultra',
          'Sony WH-1000XM5',
          'Apple MacBook Air 15" M3',
          'LG UltraGear 27GP850-B 27"'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(TRIM(COALESCE(c.title_en, ''))) IN ('home and garden', 'household appliances')
        OR LOWER(COALESCE(c.slug, '')) IN ('sakhli-da-baghi', 'saojakho-teknika')
      THEN
        (ARRAY[
          'Dyson V15 Detect Absolute',
          'KitchenAid Artisan 5-Qt Stand Mixer',
          'Philips Hue Gradient Lightstrip 75"',
          'Weber Spirit II E-310',
          'IKEA MALM 6-drawer dresser'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(TRIM(COALESCE(c.title_en, ''))) IN ('sports and recreation', 'sports')
        OR LOWER(COALESCE(c.slug, '')) = 'sporti-da-dasveneba'
      THEN
        (ARRAY[
          'Nike Air Zoom Pegasus 40',
          'Wilson Pro Staff 97 v14',
          'Garmin Forerunner 965',
          'Yeti Roadie 24 Cooler',
          'Hyperice Hypervolt 2 Pro'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%digital art%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%nft%'
      THEN
        (ARRAY[
          'Procreate timelapse + layered .procreate file',
          'Blender 3D character — rigged FBX + textures',
          'After Effects lyric video template pack',
          'Generative art print — plotted A2, archival ink',
          'Pixel art sprite sheet — commercial license OK'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%photography%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%camera lens%'
      THEN
        (ARRAY[
          'Canon RF 24-70mm f/2.8L — caps + hood',
          'Fujifilm XF 56mm f/1.2 WR — mint',
          'Godox AD200Pro + softbox kit',
          'Film lot: Portra 400 ×10 rolls — cold stored',
          'Manfrotto 055 tripod + MVH502AH head'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      WHEN LOWER(COALESCE(c.title_en, '')) LIKE '%pet%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%animal%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%dog%'
        OR LOWER(COALESCE(c.title_en, '')) LIKE '%cat%'
      THEN
        (ARRAY[
          'Large dog crate — foldable, airline-approved',
          'Cat tree 170cm — sisal posts, hammock',
          'Aquarium 240L + canister filter + LED',
          'Horse tack set — bridle + saddle pad',
          'Automatic pet feeder — app scheduling'
        ])[1 + (abs(hashtext(i2.id::text)) % 5)]

      -- Last resort: still readable swap-style blurbs (no bare "Category — 12345")
      ELSE
        LEFT(
          (ARRAY[
            COALESCE(NULLIF(TRIM(c.title_en), ''), 'Item') || ': swap-ready bundle — see photos & description',
            'Gently used ' || COALESCE(NULLIF(TRIM(c.title_en), ''), 'item') || ' — smoke-free home',
            COALESCE(NULLIF(TRIM(c.title_en), ''), 'Listing') || ' — open to trades, message with offers',
            'Curated ' || COALESCE(NULLIF(TRIM(c.title_en), ''), 'pick') || ' — authentic, can meet downtown',
            COALESCE(NULLIF(TRIM(c.title_en), ''), 'Item') || ' — spare / duplicate, passing it on',
            COALESCE(NULLIF(TRIM(c.title_en), ''), 'Item') || ' — light wear, works as it should',
            'Interesting ' || COALESCE(NULLIF(TRIM(c.title_en), ''), 'find') || ' — rare config, DM for details'
          ])[1 + (abs(hashtext(i2.id::text)) % 7)],
          255
        )
    END AS new_title
  FROM public.items i2
  LEFT JOIN public.categories c ON c.id = i2.category_id
) x
WHERE i.id = x.id;
