-- Migration: Insert categories from cats.json
-- Generated from docs/cats.json
-- Total categories: 1738

BEGIN;

-- Clear existing categories (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE public.categories CASCADE;

INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('90d8c15b-2969-43a2-9c19-57622d1634af', NULL, 'საახალწლო პროდუქცია', 'New Year Products', 'saakhaltslo-produktsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7e67fa17-2362-457c-8c82-9f20e57e4af1', NULL, 'მომსახურება', 'Services', 'momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('412b1bff-50b6-4996-8d73-d48f8435d60d', NULL, 'გაქირავება', 'Rent', 'gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('009db21a-6a40-47d2-86fe-c60b9df042ba', NULL, 'სახლი და ბაღი', 'Home and Garden', 'sakhli-da-baghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', NULL, 'საოჯახო ტექნიკა', 'Household Appliances', 'saojakho-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('131f607a-07f9-4d2d-ad3c-d0b5f8f98d67', NULL, 'ტექნიკა', 'Technology', 'teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('82b9db5a-2f2e-4f5c-b771-51221919ac5e', NULL, 'ნადირობა და თევზაობა', 'Hunting and Fishing', 'nadiroba-da-tevzaoba', '🎯', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d55a7743-2b7e-4ab6-8e7b-8fa0d1ec6da0', NULL, 'მუსიკა', 'Music', 'musika', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ddf737dd-1311-40a8-b3b1-51123e2fbb70', NULL, 'საბავშვო', 'Children', 'sabavshvo', '🧸', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bb92c02b-0473-499a-a314-6a9902ec29e9', NULL, 'სილამაზე და მოდა', 'Beauty and Fashion', 'silamaze-da-moda', '💄', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6519c780-4070-44f4-a594-21b2d1b0013d', NULL, 'მშენებლობა და რემონტი', 'Construction and Renovation', 'mshenebloba-da-remonti', '🔨', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f953066b-f598-469f-ae99-ae157c795efd', NULL, 'სოფლის მეურნეობა', 'Agriculture', 'soplis-meurneoba', '🚜', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('591ac6de-56ee-4b72-9a85-f911b2572385', NULL, 'ცხოველები', 'Animals', 'tskhovelebi', '🐾', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('309c9b08-71ac-4728-852d-b0a5a9ae709a', NULL, 'სპორტი და დასვენება', 'Sports and Recreation', 'sporti-da-dasveneba', '⚽', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1146af06-88bb-4260-8b60-ebe56dad1584', NULL, 'ბიზნესი და დანადგარები', 'Business and Equipment', 'biznesi-da-danadgarebi', '💼', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ca35a994-f20f-49aa-9b1a-b37680632e7c', NULL, 'წიგნები და კანცელარია', 'Books and Stationery', 'tsignebi-da-kantselaria', '📚', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a87811fd-aeda-4544-a699-ac566a2c2376', NULL, 'ხელოვნება და საკოლექციო', 'Art and Collectibles', 'khelovneba-da-sakolektsio', '🎨', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2bc235e6-3dc3-47d9-93e8-5cb9127a0f17', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'დესკტოპ კომპიუტერი', 'Desktop Computer', 'desktop-kompiuteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'ფეხსაცმელი', 'Footwear', 'pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a5f33f64-1f91-472a-adf4-0dd5ff93ee7f', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'მობილური ტელეფონი', 'Mobile Phone', 'mobiluri-teleponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'bb92c02b-0473-499a-a314-6a9902ec29e9', 'ტანსაცმელი და აქსესუარები', 'Clothing and Accessories', 'tansatsmeli-da-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02469ed3-eeb1-4d30-afde-dc155f1bfd99', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'თაფლი', 'Honey', 'tapli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('254228c2-2d2e-4c79-abab-abbc9464f1e0', 'fb5e2c93-e3f0-4c43-8503-dd90861539de', 'GPS ნავიგატორი', 'GPS Navigator', 'gps-navigatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('09a8a4af-a872-4a42-825c-447cf7343475', '487e4cc7-bd22-4936-8ce4-be93ce2b4eff', 'ხაზის ტელეფონი', 'Landline Phone', 'khazis-teleponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8e084520-14de-43b9-aaad-c779176f8980', 'cf0335e3-c07c-4011-bf87-c73a674aa77e', 'გეიმინგ სავარძელი', 'Gaming Chair', 'geiming-savardzeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e282ac83-2890-4128-b53b-c7c862b395a3', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორის ეკრანი', 'Projector Screen', 'proektoris-ekrani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1a261ff2-ce3f-423b-b916-8d16ae8524e4', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'პრინტერი', 'Printer', 'printeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9e9c4dac-bba0-4981-9172-106667e44efd', 'fa1192dd-94fe-41ae-aefc-885e2e6a0296', 'პორტატული დამტენი/Power Bank', 'Portable Charger/Power Bank', 'portatuli-damteni-power-bank', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('09f9b085-ac7c-4997-b858-0e4fee610daf', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'სალაშქრო ფეხსაცმელი', 'Hiking Boots', 'salashkro-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'საოჯახო წვრილი ტექნიკა', 'Small Household Appliances', 'saojakho-tsvrili-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d66c7e9e-3df9-4b5d-9c02-4278dbf882b3', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'მარკები', 'Brands', 'markebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('da6af2ee-4e0d-4fcb-86ea-e3cd4c523f7a', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'მოდელები', 'Models', 'modelebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7f086ecc-4699-47e2-889a-0c6690345fd0', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'მონეტები, ბანკნოტები', 'Coins, Banknotes', 'monetebi-banknotebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5f9771c0-7fb3-40ed-840d-1707e33d2ca9', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ქანდაკება, ფიგურა', 'Sculpture, Figure', 'kandakeba-pigura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ca56852-8d01-4c73-a894-a732c27b9f34', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ავეჯი', 'Furniture', 'aveji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('21efd2cb-0f7c-4193-b493-9795fb38fbb9', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'არქეოლოგიური', 'Archaeological', 'arkeologiuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('31c2de23-eea1-49f0-96f5-c39835768d08', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'გამოჩენილი ადამიანების ნივთები', 'Famous People Items', 'gamochenili-adamianebis-nivtebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2b03fbcb-6ba8-4045-8de7-c88d3aa330bf', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'იარაღი', 'Weapons', 'iaraghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5d58335f-26a4-4163-a4d1-69876e69c929', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'მედალი, სამკერდე ნიშანი', 'Medal, Badge', 'medali-samkerde-nishani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('946a5a84-6f53-4307-84a1-9e9974b5f9a0', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'მუსიკალური ინსტრუმენტი', 'Musical Instrument', 'musikaluri-instrumenti', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('20e4d15d-59d8-4de1-be2d-4d512b6d3ade', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ნახატი', 'Painting', 'nakhati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ed9112c-c633-460a-957b-64e73e1258ad', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'საათი', 'Watch', 'saati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ae3f8e1f-cc02-457d-86c0-1e73615f72a7', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'სამკაული', 'Jewelry', 'samkauli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5f0aae62-df14-48eb-84d0-4708f68910e1', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'საოჯახო ნივთები', 'Household Items', 'saojakho-nivtebi', '🏠', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('29f777ba-9aa8-4800-83e7-8ea9e945519f', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'სასმელი', 'Beverage', 'sasmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('501bde52-db85-424a-9c0a-729450efcdf8', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'საყვავილე, ლარნაკი', 'Vase, Lamp', 'saqvavile-larnaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('62f7391e-cf93-4bdf-895a-0ea59f530663', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ფერწერა', 'Painting', 'pertsera', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('df749fb0-1fdd-4593-9868-9232fc9d8d3c', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ციფრული ხელოვნება', 'Digital Art', 'tsipruli-khelovneba', '🎨', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d2435d07-e0a4-43b8-a941-a829a30fa9b7', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'წიგნი', 'Book', 'tsigni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea8a759b-a4fc-4a58-b994-33b7a634e3fd', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ჭურჭელი', 'Dishes', 'churcheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9fe7c878-6c60-4a0d-9d0b-7a6e9d9a584d', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ხალიჩა', 'Carpet', 'khalicha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('43e6a334-2ae5-4d78-97aa-898f0b7639aa', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ხატები, საეკლესიო ნივთები', 'Icons, Church Items', 'khatebi-saeklesio-nivtebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1b434090-6853-401f-bf1e-2ead4bcdb370', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'ანტიკვარული სათამაშოები', 'Antique Toys', 'antikvaruli-satamashoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('98459cce-336b-4a26-b425-354800abc0f9', 'e8263f77-2ca7-49fe-9373-cf926c513d96', 'მეტალო დეტექტორი', 'Metal Detector', 'metalo-detektori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('038fdfaa-98a1-4a31-8709-ee3b18de87f5', 'ca35a994-f20f-49aa-9b1a-b37680632e7c', 'მუსიკა', 'Music', 'musika', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('af791725-9ea6-45a3-b9a2-8bb6d30af06e', 'ca35a994-f20f-49aa-9b1a-b37680632e7c', 'ნოტები', 'Sheet Music', 'notebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7bd2cf76-4e6e-4c3f-857b-d6c02cefdc62', 'ca35a994-f20f-49aa-9b1a-b37680632e7c', 'ჟურნალი', 'Magazine', 'zhurnali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c244a73-f4fb-41b8-952e-30fca3b17fc8', 'ca35a994-f20f-49aa-9b1a-b37680632e7c', 'სამხატვრო და არქიტექტურული ინვენტარი', 'and', 'samkhatvro-da-arkitekturuli-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ad085b34-c93b-408c-ab07-9e0d513394a4', 'ca35a994-f20f-49aa-9b1a-b37680632e7c', 'ვიდეო', 'Video', 'video', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0090fbc5-5ee4-42da-9c77-19a9e46a8ba7', 'ca35a994-f20f-49aa-9b1a-b37680632e7c', 'საკანცელარიო ნივთები', 'Items', 'sakantselario-nivtebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fd7baea9-584c-4bac-b626-3e8d019426bd', 'ca35a994-f20f-49aa-9b1a-b37680632e7c', 'წიგნები', 'Tsignebi', 'tsignebi', '📚', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('81ff0484-2443-478d-8430-2aa3b61f232d', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'ნოუთბუქი', 'Noutbuki', 'noutbuki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f98faeb9-429d-4450-8aae-050cbeb9a832', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'ინტიმური მოწყობილობები', 'Intimuri Motsqobilobebi', 'intimuri-motsqobilobebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('175e7a03-661d-40b6-bb37-985cb931842a', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'სამართებელი და ატრიბუტები', 'and', 'samartebeli-da-atributebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e3cabccd-da86-4af4-951f-21d114f8c8dd', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'სუნამოები', 'Sunamoebi', 'sunamoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1b70d902-015b-4735-83f2-30a73f6ac336', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'ხელსაწმენდი/ბამბა', 'Khelsatsmendi Bamba', 'khelsatsmendi-bamba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7b38c1fc-7c78-41f1-9019-5cd964685ffa', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'ალკოტესტი', 'Alkotesti', 'alkotesti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c8d0f777-dd9b-43b5-bbae-c60619054084', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'კოსმეტიკური ქილები/კოლოფები', 'Kosmetikuri Kilebi Kolopebi', 'kosmetikuri-kilebi-kolopebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d886aa12-444b-477f-8a7b-6ca9838a534c', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'ნიკოტინის პლასტირი', 'Nikotinis Plastiri', 'nikotinis-plastiri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d43b2e5a-ecd3-4373-b1b9-e6428c4357a5', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'პირის ღრუს ჰიგიენა', 'Piris Ghrus Higiena', 'piris-ghrus-higiena', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c67f8aa4-83eb-4fcb-bc61-9b063ad442df', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'სასაჩუქრე ნაკრები მამაკაცისთვის', 'Sasachukre Nakrebi Mamakatsistvis', 'sasachukre-nakrebi-mamakatsistvis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c9985cea-6db9-4bd9-a595-0298cc857eb2', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'სასაჩუქრე ნაკრები ქალისთვის', 'Sasachukre Nakrebi Kalistvis', 'sasachukre-nakrebi-kalistvis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fd7aea14-aeb8-45c8-bf8a-df8052beb847', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'ქალთა ჰიგიენა', 'Kalta Higiena', 'kalta-higiena', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('31f52c10-3c3b-4419-bdf2-aa1f762d0ab1', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'ეპილაციის საშუალებები', 'Epilatsiis Sashualebebi', 'epilatsiis-sashualebebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('10c4cdb8-5e07-451c-a68c-c55d5b628658', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'სამედიცინო პროდუქცია', 'Sameditsino Produktsia', 'sameditsino-produktsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'დეკორატიული კოსმეტიკა/აქსესუარები', 'Dekoratiuli Kosmetika Aksesuarebi', 'dekoratiuli-kosmetika-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('08a140d2-c844-49f9-9dd5-58f991d84594', 'cf042e48-e79a-4bd1-9c80-f46178029443', 'თავის მოვლა', 'Personal Care', 'tavis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('229b1561-54ea-4483-86e2-2cf26faaa11a', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'კაცის ტანსაცმელი', 'Katsis Tansatsmeli', 'katsis-tansatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('245f741c-b652-4078-a944-0fb5d6b9d7b1', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'ნაციონალური სამოსი', 'Natsionaluri Samosi', 'natsionaluri-samosi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('03de0208-ac3e-4215-89b2-ee7ee2df9bff', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'სათვალე', 'Satvale', 'satvale', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('745f42e2-0f7e-4a33-85ce-81841587ee38', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'სპეცტანსაცმელი, სპორტული', 'Spetstansatsmeli Sportuli', 'spetstansatsmeli-sportuli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d3db4175-ec0f-4623-a17a-7aed2b78186d', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'ქალის ტანსაცმელი', 'Kalis Tansatsmeli', 'kalis-tansatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f2a842c6-da89-4f8e-b761-235ccb2398f4', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'ჭრა-კერვის ხელსაწყოები', 'Chra Kervis Khelsatsqoebi', 'chra-kervis-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7a9ac67c-cf82-465a-86c9-fa4f333e9c41', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'მეორადი ტანსაცმლის ფუთები', 'Meoradi Tansatsmlis Putebi', 'meoradi-tansatsmlis-putebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('729e11ed-083a-40ca-956d-a05c588f8fcd', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'კლასიკური ჩანთები', 'Klasikuri Chantebi', 'klasikuri-chantebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aa51bbd0-b51a-4334-9833-79fcdcf301ea', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'სათამაშოები', 'Satamashoebi', 'satamashoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5345b286-d3de-4934-8aa7-a93e81d3a5b1', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'აბაზანა, მოვლა, ჯანმრთელობა', 'Abazana Movla Janmrteloba', 'abazana-movla-janmrteloba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('078aed41-037c-46d6-9bf6-7847e972ad93', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'ბავშვთა კვება', 'Bavshvta Kveba', 'bavshvta-kveba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('54fe219e-d8de-472f-a31a-5316a3568d8a', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'ბავშვთა უსაფრთხოება', 'Bavshvta Usaprtkhoeba', 'bavshvta-usaprtkhoeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('caa649aa-aea6-472a-ac97-cb80e06c19b7', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'ბიჭის ტანსაცმელი', 'Bichis Tansatsmeli', 'bichis-tansatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a354d1c0-d5ea-4dea-8ad6-1cad426288f2', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'გოგოს ტანსაცმელი', 'Gogos Tansatsmeli', 'gogos-tansatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('03c1b5b2-9072-4219-8866-8eee87b097e4', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'მოწყობილობები ბავშვებისთვის', 'Motsqobilobebi Bavshvebistvis', 'motsqobilobebi-bavshvebistvis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cf1a7483-edab-4e87-9206-ea4a76418731', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'საბავშვო ეტლები, სავარძლები', 'Children', 'sabavshvo-etlebi-savardzlebi', '🧸', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('af5281be-545e-4915-a3bc-2dbd88465421', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'საბავშვო საწოლი და აქსესუარები', 'Children', 'sabavshvo-satsoli-da-aksesuarebi', '🧸', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37a4b054-ebb2-40a9-9c61-ac2fc7ccef79', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'ჩვილის ტანსაცმელი', 'Chvilis Tansatsmeli', 'chvilis-tansatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('01a0565a-f1f1-4b00-92ca-c87c9ea44ada', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'ბავშვის ფეხსაცმელი', 'Footwear', 'bavshvis-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2e19b96e-f5f5-4a42-8019-7ecf8c3edde0', 'ddf737dd-1311-40a8-b3b1-51123e2fbb70', 'საბავშვო დრონები', 'Children', 'sabavshvo-dronebi', '🧸', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'მობილურის აქსესუარები ', 'Mobiluris Aksesuarebi', 'mobiluris-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c6c698e8-41ad-46ee-b328-28df84254193', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'DVD/ვიდეოტექნიკა', 'Technology', 'dvd-videoteknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1916bc85-4cd9-4063-a0ca-6691238304d3', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ბარათის წამკითხველი', 'Baratis Tsamkitkhveli', 'baratis-tsamkitkhveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('744c12c1-0f63-4ebe-a6b6-fb7a8bf0be43', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'დინამიკი', 'Dinamiki', 'dinamiki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('26c0149a-cea9-4c75-9916-ddb385a459b9', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ვიდეოკამერა', 'Videokamera', 'videokamera', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1940a269-df46-4bc5-a705-2881d3e46b6c', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ვიდეოტექნიკის აქსესუარი', 'Videoteknikis Aksesuari', 'videoteknikis-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e5a0730-dd83-4381-9548-cd4dbb67bcd3', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'მუსიკალური ტექნიკა', 'Technology', 'musikaluri-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7751da2b-b7ec-4561-b63c-0ed13f8746fa', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ტელევიზორი', 'Televizori', 'televizori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4b675ea6-0bee-4826-8b33-1c34fe8c0992', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ფლეიერი', 'Pleieri', 'pleieri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0186e0a5-6f3c-4632-97c1-0d4760d173cf', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ფოტოკამერა', 'Potokamera', 'potokamera', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a0f20ff1-d9a3-461e-a27c-2ff1dbea69d7', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ფოტოკამერის აქსესუარი', 'Potokameris Aksesuari', 'potokameris-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('404d7f16-bece-42c5-8dff-d7e7f9245727', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'აუდიო-ვიდეო ფირი (კასეტა)', 'Audio Video Piri Kaseta', 'audio-video-piri-kaseta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0c32502b-d8bb-4dba-8789-37906d7be426', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'მეხსიერების ბარათი', 'Mekhsierebis Barati', 'mekhsierebis-barati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('615a33d8-0f29-4f17-8ba3-8c735add5248', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ობიექტივი', 'Obiektivi', 'obiektivi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dfd2400e-10ca-4642-b3c0-8321d0408cf1', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'სატელიტური ანტენა', 'Satelituri Antena', 'satelituri-antena', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d7642707-ee03-44f0-a503-fc7a94b5bbea', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ტვ მოწყობილობა და აქსესუარი', 'and', 'tv-motsqobiloba-da-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a828e0da-5bef-423b-a546-665f3ad25119', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ყურსასმენი', 'Qursasmeni', 'qursasmeni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba586f0a-1b45-4ad6-96ba-5d3ab552f764', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'აქსესუარი ყურსასმენისთვის', 'Aksesuari Qursasmenistvis', 'aksesuari-qursasmenistvis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('59301055-16e0-4cbe-8411-f7ce13f812aa', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'დრონი', 'Droni', 'droni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a120ea62-25c3-495b-8e84-5584f1e0533c', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ელექტრონული მთარგმნელი', 'Elektronuli Mtargmneli', 'elektronuli-mtargmneli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('727757ee-2e9a-40ad-99b6-ca64fe680dc0', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'კარაოკე მიკროფონი', 'Karaoke Mikroponi', 'karaoke-mikroponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('50a13afb-b8c4-4790-a977-9deb15528cb1', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'მეგაფონი (რუპორი)', 'Megaponi Rupori', 'megaponi-rupori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e531bcfe-2c0e-4d8a-a98f-1de37ffd47f1', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'სასცენო ეფექტების ტექნიკა', 'Technology', 'sastseno-epektebis-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('125e8e56-dd71-40a9-baf0-b60bcc0d57d5', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ტელესკოპი', 'Teleskopi', 'teleskopi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('636e039e-4e4f-4369-ae62-8b2ca8656088', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ციფრული ფოტოჩარჩო', 'Tsipruli Potocharcho', 'tsipruli-potocharcho', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('478483d0-f49a-4a6a-9138-d6896a85ab33', 'b66112ac-d0bb-4e1c-801f-a8cee5e1c115', 'ავტომობილის აუდიო-ვიდეო სისტემები', 'Avtomobilis Audio Video Sistemebi', 'avtomobilis-audio-video-sistemebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4e1044ac-cd5e-495e-b2b6-2ed6d42821cb', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'საათი', 'Watch', 'saati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7cb523fa-30f2-41dc-b44e-815aa6729847', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'ბეჭედი', 'Bechedi', 'bechedi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa1b99f9-7e16-40db-8cf9-4c5a17ce082a', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'ბროში', 'Broshi', 'broshi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ecfe6946-8127-44e3-b8b0-90636170ea14', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'კულონი', 'Kuloni', 'kuloni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5afd95f6-f000-4cf4-bf6d-e2e0cda4bcc3', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'პირსინგი', 'Pirsingi', 'pirsingi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1dc6e579-224f-42a5-bd42-e4a8fb183a9f', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'სამაჯური', 'Samajuri', 'samajuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4693585e-3eba-42aa-b2ce-7b21a2ec670f', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'სამკაულის ზარდახშა/საკიდი', 'Jewelry', 'samkaulis-zardakhsha-sakidi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b59d8434-bcce-4687-b555-ad1dc210b199', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'საყურე', 'Saqure', 'saqure', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ef466faf-adfa-4f3e-993c-f76ce2cfadc8', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'ყელსაბამი', 'Qelsabami', 'qelsabami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d1256f1b-f83b-47eb-9d05-2485f59d2bab', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'ძეწკვი', 'Dzetskvi', 'dzetskvi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e43324f-7bd6-4bde-8b27-d0a18a4978f2', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'ძვირფასი ქვა', 'Dzvirpasi Kva', 'dzvirpasi-kva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('450e1139-7b78-4887-84b6-194f6f108f50', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'ჯვარი', 'Jvari', 'jvari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('77991619-0903-4f2f-9399-9d52769853d9', 'd95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'სამკლაურის საკინძი (ზაპონკა)', 'Samklauris Sakindzi Zaponka', 'samklauris-sakindzi-zaponka', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('504632b5-b3ed-4efc-9a94-ba0089fbdaec', '37046868-99b6-477f-a589-4e11f3212c8f', 'კლავიშიანი ინსტრუმენტი', 'Klavishiani Instrumenti', 'klavishiani-instrumenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d043b335-b41d-4e94-90f9-c04398642532', '37046868-99b6-477f-a589-4e11f3212c8f', 'აქსესუარი', 'Aksesuari', 'aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('833af973-4696-4b2e-819f-9a6ecb5f90c1', '37046868-99b6-477f-a589-4e11f3212c8f', 'დასარტყამი/პერკუსია', 'and', 'dasartqami-perkusia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1d66a17d-c961-497f-b6c6-9116ea6192c7', '37046868-99b6-477f-a589-4e11f3212c8f', 'მუსიკალური აპარატურა', 'Music', 'musikaluri-aparatura', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d07d26ca-757e-4485-a28e-fadae32d447c', '37046868-99b6-477f-a589-4e11f3212c8f', 'სასულე ინსტრუმენტი', 'Sasule Instrumenti', 'sasule-instrumenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2464ce5b-42c4-4bbe-9d5d-d285e2fb44c4', '37046868-99b6-477f-a589-4e11f3212c8f', 'სიმიანი ინსტრუმენტი', 'Simiani Instrumenti', 'simiani-instrumenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f73b1bc5-1b74-4072-89c4-2cea02acceda', '37046868-99b6-477f-a589-4e11f3212c8f', 'ხემიანი ინსტრუმენტი', 'Khemiani Instrumenti', 'khemiani-instrumenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1b7cc900-4887-4eb9-99df-fd626e3da30b', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'გაზის იარაღი', 'Weapons', 'gazis-iaraghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('45a1d5fa-d051-4ac8-83b4-49da7270fa38', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'თავდაცვითი საშუალება', 'and', 'tavdatsviti-sashualeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('be871742-dc14-4cc1-b8e6-2225e289de57', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'იარაღის ნაწილი', 'Weapons', 'iaraghis-natsili', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6dce7fe-7e0c-4195-a49b-3aaa1f4f5159', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'პნევმატური იარაღი', 'Weapons', 'pnevmaturi-iaraghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cd2fc7ea-60a5-4cb7-85f1-34e74920a909', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'პნევმატური იარაღის ვაზნა', 'Weapons', 'pnevmaturi-iaraghis-vazna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5f13cc24-398e-4c75-ab0e-7936fb02499a', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'სათევზაო ინვენტარი', 'Satevzao Inventari', 'satevzao-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a9b84438-2699-4d26-beed-3e08c340bd3f', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'სანადირო ინვენტარი', 'Sanadiro Inventari', 'sanadiro-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('82560b14-3418-41f7-9c27-5ca0c2237a04', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'სასიგნალო (სტარტოვკა) იარაღი', 'Weapons', 'sasignalo-startovka-iaraghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0d65545d-4a8f-42d1-8a93-19f770275af9', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'ცეცხლსასროლი იარაღი', 'Weapons', 'tsetskhlsasroli-iaraghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9048cfa2-77f4-4bb5-9aeb-78cc54352250', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'ცეცხლსასროლი იარაღის ვაზნა', 'Weapons', 'tsetskhlsasroli-iaraghis-vazna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4616463a-da28-4574-8a57-aad619575dab', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'ცივი იარაღი', 'Weapons', 'tsivi-iaraghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('897c5e78-5d50-4201-aea1-77bbfc57db98', '82b9db5a-2f2e-4f5c-b771-51221919ac5e', 'ტაქტიკური ხელთათმანი', 'Taktikuri Kheltatmani', 'taktikuri-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3efcbfe1-f636-40aa-9512-1c7fb53fd3b5', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'ალბომი', 'Albomi', 'albomi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b27068fa-e512-4524-a1e9-b104993ab1e2', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'დოკუმენტური პროზა/ესეისტიკა', 'Dokumenturi Proza Eseistika', 'dokumenturi-proza-eseistika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('467bef16-ad0e-4a23-8267-fd63ae4021be', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'თარგმნილი პროზა', 'Targmnili Proza', 'targmnili-proza', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f36b9cc2-f9db-4b6c-98cc-58af5c9f4b69', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'კინობიბლიოთეკა', 'Kinobiblioteka', 'kinobiblioteka', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f9671b06-3b4f-452c-bb97-951ffdcd0e9a', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'კულინარია', 'Kulinaria', 'kulinaria', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ee0af34-6cfe-48ff-b169-329372c7d676', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'ლექსიკონი', 'Leksikoni', 'leksikoni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8432f7b5-bef3-4529-a821-7b36b4595fe0', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'მხატვრული ლიტერატურა', 'Mkhatvruli Literatura', 'mkhatvruli-literatura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('77153821-71c9-4aad-9a84-a2b9f069721c', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'საბავშვო ლიტერატურა', 'Children', 'sabavshvo-literatura', '🧸', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('050637b5-c808-4743-b3a2-02bc45f13dde', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'საზოგადოება/პოლიტიკა', 'Sazogadoeba Politika', 'sazogadoeba-politika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4b5bdd2b-1b8f-4b76-bced-b153f325c7ae', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'სამეცნიერო-ტექნიკური', 'Sametsniero Teknikuri', 'sametsniero-teknikuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bc54827b-223d-49a4-bde5-b25e3fea351f', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'ქართული პროზა', 'Kartuli Proza', 'kartuli-proza', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('734e8504-13e2-44b8-abfb-f5e8d6156411', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'ბიბლია/სახარება', 'Biblia Sakhareba', 'biblia-sakhareba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1473388b-3905-4ec1-8671-63c93ccaca81', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'ენციკლოპედია', 'Entsiklopedia', 'entsiklopedia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b1b101ed-b39a-41c4-85f7-4bbab9b9a3c7', 'fd7baea9-584c-4bac-b626-3e8d019426bd', 'სახელმძღვანელოები', 'Sakhelmdzghvaneloebi', 'sakhelmdzghvaneloebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f9b0c8ab-94f0-433e-a116-602227c518af', 'ad085b34-c93b-408c-ab07-9e0d513394a4', 'CD', 'CD', 'cd', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('720ae791-e8d9-428d-9c54-09e3211b54a5', 'ad085b34-c93b-408c-ab07-9e0d513394a4', 'DVD/Blu ray', 'DVD Blu Ray', 'dvd-blu-ray', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('523ef6ee-1d71-4472-99c8-e33fa3d7daa9', 'ad085b34-c93b-408c-ab07-9e0d513394a4', 'ვიდეოკასეტები', 'Videokasetebi', 'videokasetebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7ac8f2cf-2086-44d2-8232-08cfc6ba4efe', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ალპინიზმი', 'Alpinizmi', 'alpinizmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('42ad923f-52b8-4802-85a2-c44ef3dc9407', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'აუზი/აქსესუარი', 'Auzi Aksesuari', 'auzi-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5450fce7-01f1-455b-a125-28e14bc6fad6', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'გორგოლაჭები', 'Gorgolachebi', 'gorgolachebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c824c204-f7b8-4658-bdcf-cca8bcdae77e', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ველოსიპედი', 'Velosipedi', 'velosipedi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aaf80a66-89cf-4ba1-ab37-4001b4adfc94', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ველოსიპედის ნაწილი/აქსესუარი', 'Velosipedis Natsili Aksesuari', 'velosipedis-natsili-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a6881152-6e0b-450d-9a04-a6a936baa38e', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ლაშქრობა და ტურიზმი', 'and', 'lashkroba-da-turizmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('97c156e8-8a5d-489f-823d-a6d2c29ad6b1', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'მოტო ეკიპირება', 'Moto Ekipireba', 'moto-ekipireba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8a13b3dd-44bc-449c-bc3c-ab7579b1546d', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'სავარჯიშო ინვენტარი', 'Savarjisho Inventari', 'savarjisho-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('404f2dd9-a275-48a6-965e-308d1db522bd', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'სამაგიდო თამაშები', 'Samagido Tamashebi', 'samagido-tamashebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cd3d2b80-05f4-4e5e-9ecc-a799e88e0951', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'საჰაერო სპორტი', 'Sahaero Sporti', 'sahaero-sporti', '⚽', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d71c32d6-8601-4b68-b4a4-18167ea5de1f', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'სკეიტბორდი', 'Skeitbordi', 'skeitbordi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7669c271-cf0b-414c-a9a2-8b9765cacf5e', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ცხენოსნობა', 'Tskhenosnoba', 'tskhenosnoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('94ed8e2b-ca2a-44f4-b1d0-a7dc07daef61', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'წყლის სპორტი', 'Tsqlis Sporti', 'tsqlis-sporti', '⚽', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('22566e9f-c6a7-4f17-befb-00e497663ab0', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ჰოვერბორდი', 'Hoverbordi', 'hoverbordi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dd4af3a8-b6c4-43b3-af56-16c25eb7e283', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'EUC ელექტრო მონობორბალი', 'EUC Elektro Monoborbali', 'euc-elektro-monoborbali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e9bb7487-7360-4cdb-975e-fb2216893336', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'Kick სკუტერი', 'Kick Skuteri', 'kick-skuteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('79b45ba9-1ecb-4744-ba57-89b9d2ee9f53', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'Kick სკუტერის აქსესუარები/ნაწილები', 'Kick Skuteris Aksesuarebi Natsilebi', 'kick-skuteris-aksesuarebi-natsilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('34db3034-1581-4fed-acf6-826d4465f20c', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'სალაშქრო/სამოგზაურო ჩანთა', 'Salashkro Samogzauro Chanta', 'salashkro-samogzauro-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('236790b1-005b-4d94-9936-b30c82da69b2', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'სხეულის დამცავი', 'and', 'skheulis-damtsavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dbefb0e7-9bdc-4021-8a6b-6636a04d1499', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'საკვები დანამატები', 'and', 'sakvebi-danamatebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c0350a2-ad91-4726-97e3-04d6267942f0', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ზამთრის სპორტი', 'Zamtris Sporti', 'zamtris-sporti', '⚽', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e412f806-2ef8-49fe-ba25-4899d0f0ea7e', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'სპორტული ინვენტარი', 'Sportuli Inventari', 'sportuli-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('369dc8c4-045d-4ab8-9b6a-ad4ecaf7cc64', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'ავზი', 'Avzi', 'avzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bf79c755-8908-4c8d-8d9e-677868bf15d2', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'ბალონი', 'Baloni', 'baloni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bde1fb28-c868-4309-9635-f19b01d570cc', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'გასართობი აპარატი', 'Gasartobi Aparati', 'gasartobi-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ab413d12-ef1e-4205-8f28-d96092453105', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'გენერატორი/ტრანსფორმატორი', 'Generatori Transpormatori', 'generatori-transpormatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b9c2a5cc-37f2-48a4-9afd-9a23bf535bef', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'დაზგა/დანადგარი', 'and', 'dazga-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a59b8fb0-315b-4462-8425-b280b6164d49', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'დანადგარი სალონისთვის', 'and', 'danadgari-salonistvis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b1cded75-2224-448c-98ab-f8a3e452c59e', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'იყიდება ბიზნესი', 'Iqideba Biznesi', 'iqideba-biznesi', '💼', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f07b05fa-392f-4472-9d91-1a5efa7c0c11', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'კომპრესორი', 'Kompresori', 'kompresori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f094190e-6e51-46d6-8d2e-221983c3f8f6', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'კონტეინერი/ანგარი', 'Konteineri Angari', 'konteineri-angari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3571b200-6b83-44a1-b15e-933a810d8ea5', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'კოსმეტოლოგიური დანადგარი', 'and', 'kosmetologiuri-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ab95112f-d4d9-4711-8342-94fd3f583eac', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'კოტეჯი/საცხოვრებელი ვაგონი', 'Koteji Satskhovrebeli Vagoni', 'koteji-satskhovrebeli-vagoni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04ad8bb5-aceb-4034-85a6-2d98da7e7585', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'მაღალი წნევით რეცხვის აპარატი', 'Maghali Tsnevit Retskhvis Aparati', 'maghali-tsnevit-retskhvis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('108b5c96-e5b8-44fd-bb0a-dfa6f95b381e', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'პოლიგრაფიული დანადგარი', 'and', 'poligrapiuli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02937ca4-586e-4b20-8d8b-f941ad6d8b8a', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'სავაჭრო ინვენტარი', 'Savachro Inventari', 'savachro-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('de04388e-15c6-4f5d-a56b-da2bd8b12cdc', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'სამედიცინო სახარჯი მასალა/დანადგარი', 'and', 'sameditsino-sakharji-masala-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dd6dde64-e699-4acf-8224-61d045f3bf68', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'სამრეწველო მასალა', 'Samretsvelo Masala', 'samretsvelo-masala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e015747e-45f6-40d9-b66e-503527bba608', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'საქსოვი მანქანა', 'Saksovi Mankana', 'saksovi-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('08f21683-5bcd-4551-b72a-1e97aadd4373', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'სწრაფი ჩარიცხვის აპარატი', 'Stsrapi Charitskhvis Aparati', 'stsrapi-charitskhvis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9f1bf8c0-dbbd-4f2d-a66a-d0868c696f43', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'უსაფრთხოება', 'Usaprtkhoeba', 'usaprtkhoeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5758fe44-8c7f-48cd-95f3-ceaceb57a670', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'გასართობი ცენტრის/მოედნის ინვენტარი', 'Gasartobi Tsentris Moednis Inventari', 'gasartobi-tsentris-moednis-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('25941de5-1f8e-401e-893a-6c2b88fc8f9b', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'სალარო აპარატი/გადახდის ტერმინალი', 'and', 'salaro-aparati-gadakhdis-terminali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8c66c6b7-ce3d-4c53-b7eb-376c444485d3', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'სასაწყობე სტელაჟი', 'Sasatsqobe Stelazhi', 'sasatsqobe-stelazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f880c582-7042-45c4-81b7-4256565e602b', '524ec220-c4d2-4677-93b0-c5e87ddd6c20', 'სასმელი წყლის გამწმენდი დანადგარი', 'Beverage', 'sasmeli-tsqlis-gamtsmendi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7891440d-21ce-47a0-b679-d43c5fa3a438', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ავტომობილის აუდიო-ვიდეო სისტემების მონტაჟი/შეკეთება', 'Avtomobilis Audio Video Sistemebis Montazhi Sheketeba', 'avtomobilis-audio-video-sistemebis-montazhi-sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4f4de5d9-5fc3-47c3-8625-3283def06e10', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'აუდიტი/ბუღალტერია', 'Auditi Bughalteria', 'auditi-bughalteria', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b37244d-bd55-49ac-ba28-3e89d929412c', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'თარგმნა/ნოტარიული დამოწმება', 'and', 'targmna-notariuli-damotsmeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('61b35335-2b41-49f3-a39d-055314e5aef2', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'მობილური ტელეფონების/აქსესუარების სერვისი', 'Mobiluri Teleponebis Aksesuarebis Servisi', 'mobiluri-teleponebis-aksesuarebis-servisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d196eb48-d9eb-4b73-b2cb-10d161a4322f', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სარიტუალო მომსახურება', 'Services', 'saritualo-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8ba60003-8f70-47fc-884a-3251b2c98a42', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ცეცხლსასროლი იარაღების შეკეთება/რესტავრაცია', 'Tsetskhlsasroli Iaraghebis Sheketeba Restavratsia', 'tsetskhlsasroli-iaraghebis-sheketeba-restavratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d86a19fa-765d-4b84-ae77-afe687e0fac2', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'გრავირება/ლაზერით ჭრა', 'Gravireba Lazerit Chra', 'gravireba-lazerit-chra', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d6d5066d-e5a5-4e87-8d1f-75db57b4bb6b', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'დასუფთავების სერვისი', 'and', 'dasuptavebis-servisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c945fda-0ebe-4c52-b0d3-64f34695261a', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ველოსიპედის შეკეთება', 'Velosipedis Sheketeba', 'velosipedis-sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1d63adfb-88ad-4788-bb76-d0ef56e9b66d', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'კრაფტი/ხელნაკეთი ნივთების შექმნა', 'Items', 'krapti-khelnaketi-nivtebis-shekmna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3fbf918a-8d79-43b3-b808-5336b1724bcf', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'მაკულატურის ჩაბარება', 'Makulaturis Chabareba', 'makulaturis-chabareba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8f88cab9-782b-4389-9f27-ad382442aa95', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'მეტალოდეტექტორით მომსახურება', 'Services', 'metalodetektorit-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('def3d211-a5c1-4da6-aecc-ca91970f4424', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'მინისა და სარკის ნაკეთობების დამზადება', 'and', 'minisa-da-sarkis-naketobebis-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37d655e5-26ca-405e-b92c-b6e44fa1e2ed', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სამრეწველო დანადგარების აწყობა/შეკეთება', 'and', 'samretsvelo-danadgarebis-atsqoba-sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c29f6bab-4cf3-4b4a-af8d-62aaac4c449e', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სამრეწველო მომსახურება', 'Services', 'samretsvelo-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c36bf75-38fa-4965-abcf-60b3bb458893', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'საოფისე/სამშენებლო კონტეინერის დამზადება', 'and', 'saopise-samsheneblo-konteineris-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4750dbfc-bbce-4115-ac4f-56776edfb69f', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სასაჩუქრე ყუთების/შეფუთვის დამზადება', 'and', 'sasachukre-qutebis-sheputvis-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('846e1b32-b43b-4283-84b5-e6ed2cf52ca7', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სასოფლო-სამეურნეო მომსახურება', 'Services', 'sasoplo-sameurneo-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e523a087-ee0f-4b88-8be9-defcfd49b549', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სპორტული ინვენტარის შეკეთება/მონტაჟი', 'Sportuli Inventaris Sheketeba Montazhi', 'sportuli-inventaris-sheketeba-montazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('166c475f-38aa-4f77-9c8a-12bfd3a17631', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'უსაფრთხოების სისტემების შეკეთება/მონტაჟი', 'Usaprtkhoebis Sistemebis Sheketeba Montazhi', 'usaprtkhoebis-sistemebis-sheketeba-montazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9e2e5592-7cdb-4d2b-b71e-e8ee6e740db1', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'შრომის უსაფრთხოება', 'Shromis Usaprtkhoeba', 'shromis-usaprtkhoeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eec6051e-3217-4b6b-989d-470035b22ea3', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ჰიდროგეოლოგიური მომსახურება', 'Services', 'hidrogeologiuri-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dd1da847-5811-4a1b-a346-a5f59c0b2413', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ჰოვერბორდის/სკუტერის/საბავშვო ელექტრო მანქანის შეკეთება', 'Children', 'hoverbordis-skuteris-sabavshvo-elektro-mankanis-sheketeba', '🧸', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fd3a13e5-b87c-453b-9069-395d1fc59667', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ავეჯის დამზადება/რესტავრაცია', 'Furniture', 'avejis-damzadeba-restavratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('98a0486f-d62b-4fff-a53e-c7be4b4a623f', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'საიუველირო მომსახურება ', 'Services', 'saiuveliro-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5023bf86-b53e-4f19-a9ed-db91a31771a4', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'აუდიო/ვიდეო/ფოტო მომსახურება', 'Services', 'audio-video-poto-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('772f8539-86db-425b-8f93-dbafb4ae3417', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'მუს. აპარატურის აწყობა/შეკეთება', 'Mus Aparaturis Atsqoba Sheketeba', 'mus-aparaturis-atsqoba-sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7f2a853e-dfa3-4c2a-8f0e-657d91bee6c7', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ბეჭდვა/პოლიგრაფია', 'Bechdva Poligrapia', 'bechdva-poligrapia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('16067065-1c04-4fb3-97dd-06d7b3bc35f5', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ტურიზმი, ვიზები', 'Turizmi Vizebi', 'turizmi-vizebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('559cbe73-b766-46ee-a0a4-22b0eb2a87c9', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'რეკლამა/მარკეტინგი/PR', 'Reklama Marketingi PR', 'reklama-marketingi-pr', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8d2d1b58-bda6-4c26-8c56-2f5aa628ef7f', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'საპროექტო მომსახურება', 'Services', 'saproekto-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eef45b95-bcf9-4a5d-bb33-35196de1334e', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'იურიდიული მომსახურება', 'Services', 'iuridiuli-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('88aeb212-75c6-46b5-8d5a-8268373038c0', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სატრანსპორტო, ლოჯისტიკა', 'Satransporto Lojistika', 'satransporto-lojistika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bbf303ff-3f0e-4a24-85cd-d45a0bbda782', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'ცხოველთა სამყარო', 'Tskhovelta Samqaro', 'tskhovelta-samqaro', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('afa1872b-422b-4b50-9fff-46dfac71aeba', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'კომპიუტერული მომსახურება', 'Services', 'kompiuteruli-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fbf700b8-334f-49d0-b54d-81ecca05b5c9', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'განათლება', 'Ganatleba', 'ganatleba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('631fc46a-7f6a-441d-a15b-78a5119722c0', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სადღესასწაულო', 'Sadghesastsaulo', 'sadghesastsaulo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('db37b803-1a92-4de4-934f-dd476017c0aa', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'მედიცინა/ჯანმრთელობა/სილამაზე', 'Meditsina Janmrteloba Silamaze', 'meditsina-janmrteloba-silamaze', '💄', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6353c543-4fca-4d62-80b2-aade9017578b', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'საოჯახო ტექნიკის სერვისები', 'Household', 'saojakho-teknikis-servisebi', '🏠', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b308c20f-0b44-40b0-9876-3c25d407cfe7', '7e67fa17-2362-457c-8c82-9f20e57e4af1', 'სამშენებლო-სარემონტო მომსახურება', 'Services', 'samsheneblo-saremonto-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5452db2a-b46a-44d6-a062-a4e623cb13b9', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'მისაღები ოთახის კომპლექტი', 'Misaghebi Otakhis Komplekti', 'misaghebi-otakhis-komplekti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d3bf98da-6113-459e-831f-a82e65d85655', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'სამზარეულო', 'Samzareulo', 'samzareulo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('263e9d5d-d38f-4f9f-b110-5c5c56709cc2', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'საძინებლის კომპლექტი', 'Sadzineblis Komplekti', 'sadzineblis-komplekti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5a4db88b-8761-48ea-b234-48f44087c636', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'საწოლი', 'Satsoli', 'satsoli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d35abfca-75ec-43fb-9832-936222ab5931', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ტუმბო', 'Tumbo', 'tumbo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e60df3e-da20-4763-a006-afc444e1a0dc', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'აბაზანის ავეჯი', 'Furniture', 'abazanis-aveji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4b2e5f05-c33d-4e0c-864f-f4e61f4350c8', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ბარის სკამი', 'Baris Skami', 'baris-skami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('14bad5f3-c0c0-40b2-a41b-1fbeeb219193', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ბუფეტი, ჭურჭლის კარადა', 'and', 'bupeti-churchlis-karada', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a96ebec9-52c9-457a-89ec-65f6fcaa202d', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'გორგოლაჭებიანი მაგიდა', 'and', 'gorgolachebiani-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('77f0abe0-5217-4af4-b79b-55829c0e7e80', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'თარო', 'Taro', 'taro', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0194664a-4423-4caf-960e-ec0d28be9f4f', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'კარადა', 'and', 'karada', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d938b74c-3c94-40b5-ac53-a95adf464008', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'კომოდი', 'Komodi', 'komodi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac950412-8ac1-403d-bda8-6a284f57a483', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'კომპიუტერის მაგიდა', 'and', 'kompiuteris-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e36e1ba6-9431-4d2d-affc-b8306c9e3a2d', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'მაგიდა კონსოლი', 'and', 'magida-konsoli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a801ee77-5f4b-435c-a645-836a5a776892', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'მაკიაჟის მაგიდა', 'and', 'makiazhis-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4074c465-8b0c-48eb-b1d3-b06f2e3c16e9', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'მისაღები ოთახის მაგიდა', 'and', 'misaghebi-otakhis-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('93cba0ea-acb6-40f5-86ed-54211358c4da', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'მისაღები ოთახის სკამი', 'Misaghebi Otakhis Skami', 'misaghebi-otakhis-skami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b57a519f-d406-47d4-87ed-ce6133a3ec47', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ჟურნალის მაგიდა', 'Magazine', 'zhurnalis-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3f9a48ec-d700-4cf1-a9fe-626649d3fa3b', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'სამზარეულო ოთახის სკამი', 'Samzareulo Otakhis Skami', 'samzareulo-otakhis-skami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ca56e8f6-5ee2-4e5b-98d8-a3edb8cd5b2d', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'სამზარეულოს მაგიდა', 'and', 'samzareulos-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('93c8737d-ef98-4ee8-a00a-cbd625957306', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'სასკოლო/საწერი მაგიდა', 'and', 'saskolo-satseri-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('52db5438-b3e8-4bc2-b686-941de7602fe8', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ტაბურეტი', 'Tabureti', 'tabureti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b03df47-4ac7-4bb2-92c5-d2f61b1787f4', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ტანსაცმლის საკიდი', 'Tansatsmlis Sakidi', 'tansatsmlis-sakidi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('de8a110a-c40e-4998-b949-a26d737dbc46', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ტელევიზორის მაგიდა', 'and', 'televizoris-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('03e0bf92-4cf1-47de-b962-62f8ddc061cd', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ტრილიაჟი', 'Triliazhi', 'triliazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e3fc792a-1a63-490e-bdc3-21f1739ecdc0', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'საოფისე ავეჯი', 'Furniture', 'saopise-aveji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cb4ed1a2-5632-492f-ac46-6f2b8ce91d15', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'რბილი ავეჯი', 'Furniture', 'rbili-aveji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e871fb0f-915f-4186-828a-ea41126c70e4', 'dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', 'ავეჯის კომპონენტები', 'Furniture', 'avejis-komponentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cd22dbc0-216c-41f6-93a7-993f7449d9ff', 'fd3a13e5-b87c-453b-9069-395d1fc59667', 'დამზადება', 'and', 'damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b80625f3-de15-4bdb-bb01-83c601e16a47', 'fd3a13e5-b87c-453b-9069-395d1fc59667', 'რესტავრაცია', 'Restavratsia', 'restavratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('33a86797-ac21-49b3-93f9-c99bcb3df375', '6519c780-4070-44f4-a594-21b2d1b0013d', 'ლითონის მასალები', 'Litonis Masalebi', 'litonis-masalebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('07935a28-c91f-41c0-8c5f-52dcd31185ec', '6519c780-4070-44f4-a594-21b2d1b0013d', 'ხის მასალები', 'Khis Masalebi', 'khis-masalebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d1f9ea46-d728-470f-be85-5d8907ae3e87', '6519c780-4070-44f4-a594-21b2d1b0013d', 'საკეტები, ბოქლომები', 'Saketebi Boklomebi', 'saketebi-boklomebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4bd7cd13-dda9-4146-adf8-8124d61d6a7f', '6519c780-4070-44f4-a594-21b2d1b0013d', 'ცენტრალური გათბობის, კონდიცირების სისტემები', 'Tsentraluri Gatbobis Konditsirebis Sistemebi', 'tsentraluri-gatbobis-konditsirebis-sistemebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('699fd09c-7095-4749-b489-2a55478995e3', '6519c780-4070-44f4-a594-21b2d1b0013d', 'კარ-ფანჯრები, ჟალუზები, ღობეები', 'Kar Panjrebi Zhaluzebi Ghobeebi', 'kar-panjrebi-zhaluzebi-ghobeebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('66bb9404-0cba-4bc2-a598-14b4ead27815', '6519c780-4070-44f4-a594-21b2d1b0013d', 'საღებავები, ლაქები, ფითხი', 'Saghebavebi Lakebi Pitkhi', 'saghebavebi-lakebi-pitkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('db2dfb2b-c322-4d11-863c-2979d08c89c1', '6519c780-4070-44f4-a594-21b2d1b0013d', 'უსაფრთხოება და უნიფორმა', 'and', 'usaprtkhoeba-da-uniporma', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a8bfec26-ae28-4666-b7dc-4952a0c81b9c', '6519c780-4070-44f4-a594-21b2d1b0013d', 'მოსაპირკეთებელი მასალები, იატაკი', 'Mosapirketebeli Masalebi Iataki', 'mosapirketebeli-masalebi-iataki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('10746dda-83a7-4b02-8720-0d323fd85e96', '6519c780-4070-44f4-a594-21b2d1b0013d', 'სამშენებლო დანადგარები', 'and', 'samsheneblo-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9d4dfc44-5866-4bf8-91f7-4a97a46560a3', '6519c780-4070-44f4-a594-21b2d1b0013d', 'სანტექნიკა', 'Technology', 'santeknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c0122cf3-24f4-4b1d-8859-8178d5203d14', '6519c780-4070-44f4-a594-21b2d1b0013d', 'სამშენებლო მასალები', 'Samsheneblo Masalebi', 'samsheneblo-masalebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2c607179-3bf4-489c-8853-0df999004b2d', '6519c780-4070-44f4-a594-21b2d1b0013d', 'სახარჯი მასალები', 'Sakharji Masalebi', 'sakharji-masalebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0c2165f7-f222-430c-9b86-825fefbca579', '6519c780-4070-44f4-a594-21b2d1b0013d', 'ელექტროობა', 'Elektrooba', 'elektrooba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bcd83a10-a8aa-4644-b379-d4d44e099cf5', '6519c780-4070-44f4-a594-21b2d1b0013d', 'სამშენებლო/სარემონტო ხელსაწყოები', 'Samsheneblo Saremonto Khelsatsqoebi', 'samsheneblo-saremonto-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('68ff4ac5-f034-4033-a867-405fb888b7d9', '6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'სტიკერი', 'Stikeri', 'stikeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2c2c35bc-c929-45e4-98a3-ea04d1ae8619', '6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'სუვენირი', 'Suveniri', 'suveniri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('824e2b92-086f-4942-9046-c60aae36fca5', '6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'ჩილიმი', 'Chilimi', 'chilimi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('10200a58-ae86-49d3-9761-55c26565241a', '6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'ხელნაკეთი ნაწარმი', 'Khelnaketi Natsarmi', 'khelnaketi-natsarmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('19151503-1847-4aca-af90-bb6f64cf855d', '6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'ბრელოკი', 'Breloki', 'breloki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d41621c9-e461-439d-83cf-7ed5b04fd881', '6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'ყულაბა', 'Qulaba', 'qulaba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('10729164-5fb4-4569-adcb-2b775d9bbb0c', '6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'ხელნაკეთი ცივი იარაღი', 'Weapons', 'khelnaketi-tsivi-iaraghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9af5c4e9-5443-4899-8a5b-8da70f400f67', 'f953066b-f598-469f-ae99-ae157c795efd', 'სათავსო ნაგებობა', 'Satavso Nageboba', 'satavso-nageboba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6a153f20-baea-4849-a9db-f1a0dbc0f721', 'f953066b-f598-469f-ae99-ae157c795efd', 'სათესლე მასალა', 'Satesle Masala', 'satesle-masala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ab8636d-1477-410f-b9ad-44de1b6917d6', 'f953066b-f598-469f-ae99-ae157c795efd', 'საწვავი მასალა', 'Satsvavi Masala', 'satsvavi-masala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c366563e-eade-485d-985f-6dae3e317c07', 'f953066b-f598-469f-ae99-ae157c795efd', 'მევენახეობის აქსესუარები', 'Mevenakheobis Aksesuarebi', 'mevenakheobis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8e733140-037f-47f4-8cac-7e090e959c59', 'f953066b-f598-469f-ae99-ae157c795efd', 'საკვები და სასმელი', 'Beverage', 'sakvebi-da-sasmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea8aad26-cd8f-428f-b208-d8f355b8cf87', 'f953066b-f598-469f-ae99-ae157c795efd', 'სასოფლო/სამეურნეო ნაწარმი', 'Sasoplo Sameurneo Natsarmi', 'sasoplo-sameurneo-natsarmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('023de19c-1262-4346-85f9-4e36fa89945a', 'f953066b-f598-469f-ae99-ae157c795efd', 'სასოფლო/სამეურნეო ინვენტარი', 'Sasoplo Sameurneo Inventari', 'sasoplo-sameurneo-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'f953066b-f598-469f-ae99-ae157c795efd', 'სარწყავი სისტემები/აქსესუარები', 'Sartsqavi Sistemebi Aksesuarebi', 'sartsqavi-sistemebi-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'f953066b-f598-469f-ae99-ae157c795efd', 'მცირე სასოფლო/სამეურნეო ტექნიკა-დანადგარები', 'Technology', 'mtsire-sasoplo-sameurneo-teknika-danadgarebi', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'f953066b-f598-469f-ae99-ae157c795efd', 'სასოფლო/სამეურნეო ხელსაწყოები', 'Sasoplo Sameurneo Khelsatsqoebi', 'sasoplo-sameurneo-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8dd46204-1cb5-48fb-bbab-431fc7299a55', '0090fbc5-5ee4-42da-9c77-19a9e46a8ba7', 'დროშა', 'Drosha', 'drosha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('152db4d6-4ff6-4617-ba1b-89c2c7a6b148', '0090fbc5-5ee4-42da-9c77-19a9e46a8ba7', 'საკანცელარიო ტექნიკა/ინვენტარი', 'Technology', 'sakantselario-teknika-inventari', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2a5a74fc-91df-48c1-a75f-844b3b57d8f6', '0090fbc5-5ee4-42da-9c77-19a9e46a8ba7', 'ქაღალდი', 'Kaghaldi', 'kaghaldi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('872972cd-f430-4663-b6f6-30c11acc94fa', '0090fbc5-5ee4-42da-9c77-19a9e46a8ba7', 'პოლიმერული თიხა/დანამატი/ხელსაწყო', 'and', 'polimeruli-tikha-danamati-khelsatsqo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('db249f3d-9e56-4e95-aee9-a7db61733125', '0090fbc5-5ee4-42da-9c77-19a9e46a8ba7', 'სასკოლო ჩანთა', 'Saskolo Chanta', 'saskolo-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b97d98c2-3adc-480c-bfc2-07722658a8bc', 'e3fc792a-1a63-490e-bdc3-21f1739ecdc0', 'მოსაცდელის სკამი', 'Mosatsdelis Skami', 'mosatsdelis-skami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('60bda79e-8ee7-4b20-b828-f01c2bcc5320', 'e3fc792a-1a63-490e-bdc3-21f1739ecdc0', 'საოფისე კარადა, სტელაჟი', 'and', 'saopise-karada-stelazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9b5d7b99-155c-4378-a32e-76673efc2cf6', 'e3fc792a-1a63-490e-bdc3-21f1739ecdc0', 'საოფისე მაგიდა', 'and', 'saopise-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('27e6eb1e-2c32-4766-849a-c61ec94e2daf', 'e3fc792a-1a63-490e-bdc3-21f1739ecdc0', 'საოფისე სკამი, სავარძელი', 'Saopise Skami Savardzeli', 'saopise-skami-savardzeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('75a1b399-6bd2-43e7-9ff5-5220d2741c0d', '88aeb212-75c6-46b5-8d5a-8268373038c0', 'ევაკუატორის მომსახურება', 'Services', 'evakuatoris-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('614feb24-c9a6-4ad9-8a20-fc0d9da8fafd', '88aeb212-75c6-46b5-8d5a-8268373038c0', 'მგზავრების გადაყვანის მომსახურება', 'Services', 'mgzavrebis-gadaqvanis-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c5b44b3-d6c6-4360-8120-9f4068f6bfbb', '88aeb212-75c6-46b5-8d5a-8268373038c0', 'სადისტრიბუციო მომსახურება', 'Services', 'sadistributsio-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a4323a6a-7985-4e21-ab35-6daab09bac60', '88aeb212-75c6-46b5-8d5a-8268373038c0', 'საკურიერო მომსახურება', 'Services', 'sakuriero-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6c4a3165-ead7-4023-bd2b-da839ce81f1a', '88aeb212-75c6-46b5-8d5a-8268373038c0', 'ტვირთის გადაზიდვა', 'and', 'tvirtis-gadazidva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('474a3955-fd6c-4f83-a216-d77a6df11e0b', '88aeb212-75c6-46b5-8d5a-8268373038c0', 'ტვირთის იმპორტი/ექსპორტი', 'Tvirtis Importi Eksporti', 'tvirtis-importi-eksporti', '⚽', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('86e1e079-7355-4a88-8ead-cec2439f7b80', '88aeb212-75c6-46b5-8d5a-8268373038c0', 'სამშენებლო ნარჩენების გატანა', 'Samsheneblo Narchenebis Gatana', 'samsheneblo-narchenebis-gatana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('28fcf585-f230-4162-a1ec-0c9549a8f9bf', 'afa1872b-422b-4b50-9fff-46dfac71aeba', 'პროგრამული უზრუნველყოფა', 'Programuli Uzrunvelqopa', 'programuli-uzrunvelqopa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('886ce4e2-69dd-46de-9d72-0a475ad4f3b1', 'afa1872b-422b-4b50-9fff-46dfac71aeba', 'ინფორმაციის აღდგენა', 'Inpormatsiis Aghdgena', 'inpormatsiis-aghdgena', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dc29f13c-d3f6-4b53-9787-703c9105effa', 'afa1872b-422b-4b50-9fff-46dfac71aeba', 'კარტრიჯების დატენვა', 'and', 'kartrijebis-datenva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('71841628-b686-4d2b-80a9-30eabcf0bf7d', 'afa1872b-422b-4b50-9fff-46dfac71aeba', 'კომპიუტერული ტექნიკის შეკეთება', 'Kompiuteruli Teknikis Sheketeba', 'kompiuteruli-teknikis-sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('939a67e3-534a-4f2b-a506-7869e3f67622', 'afa1872b-422b-4b50-9fff-46dfac71aeba', 'ქსელური უზრუნველყოფა', 'Kseluri Uzrunvelqopa', 'kseluri-uzrunvelqopa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c2aacff4-7693-40c2-ae12-5982eadf9643', 'afa1872b-422b-4b50-9fff-46dfac71aeba', 'ჰოსტინგი', 'Hostingi', 'hostingi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dd7a9f0f-0a4c-4c60-9e68-7a72e9107b73', 'afa1872b-422b-4b50-9fff-46dfac71aeba', 'გრაფილული დიზაინი, 3D მოდელირება', 'Grapiluli Dizaini 3D Modelireba', 'grapiluli-dizaini-3d-modelireba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d0d581e4-b8f9-4dd4-a342-ea7391c62dd1', '631fc46a-7f6a-441d-a15b-78a5119722c0', 'ბავშთა გასართობი ცენტრები', 'Bavshta Gasartobi Tsentrebi', 'bavshta-gasartobi-tsentrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('41e5a8f3-6b98-43c7-81de-a809db9ba3cd', '631fc46a-7f6a-441d-a15b-78a5119722c0', 'მუსიკალური გაფორმება', 'Music', 'musikaluri-gapormeba', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8fe7cd3b-35db-46dc-b91f-513609151488', '631fc46a-7f6a-441d-a15b-78a5119722c0', 'ფეიერვერკების მოწყობა', 'Peierverkebis Motsqoba', 'peierverkebis-motsqoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('86caa799-0e23-4c30-8229-1b31df2cba76', '631fc46a-7f6a-441d-a15b-78a5119722c0', 'ფოტო, ვიდეოს გადაღება', 'and', 'poto-videos-gadagheba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2d79751b-c945-4d6a-bfa4-18084e0a36a9', '631fc46a-7f6a-441d-a15b-78a5119722c0', 'სადღესასწაულო დეკორაციის დამზადება', 'and', 'sadghesastsaulo-dekoratsiis-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b6f6f1d-04cb-4ac6-a01d-ae2e7fea03ad', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'ეპილაცია', 'Epilatsia', 'epilatsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c54f223-dafa-4d70-9a73-1f76531f38b1', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'თერაპია', 'Terapia', 'terapia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('99ded6a8-e3ee-49ec-8311-40612b74d8d4', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'სამკურნალო მასაჟი', 'Samkurnalo Masazhi', 'samkurnalo-masazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('611c0fe1-7dbb-4c3e-af8a-c84d073466e1', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'სილამაზის სალონები', 'Silamazis Salonebi', 'silamazis-salonebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d6eb5d8f-4d23-407c-a1eb-ee043da098a4', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'სპორტული ცენტრები', 'Sportuli Tsentrebi', 'sportuli-tsentrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('735219cb-1ba0-4429-a0ee-faf0b4b43cde', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'სტომატოლოგია', 'Stomatologia', 'stomatologia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9ec021b5-6c36-40b4-95c9-84c4b52c7378', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'პირსინგი', 'Pirsingi', 'pirsingi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('261a2563-b5c3-417b-b985-a7ee9fd1bfa1', 'db37b803-1a92-4de4-934f-dd476017c0aa', 'ტატუირება', 'Tatuireba', 'tatuireba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('810ae1c0-f296-46b2-b851-43029a61b03e', '772f8539-86db-425b-8f93-dbafb4ae3417', 'აწყობა', 'Atsqoba', 'atsqoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('09e21ea5-4f99-44d0-a3a8-4a3301467da7', '772f8539-86db-425b-8f93-dbafb4ae3417', 'შეკეთება', 'Sheketeba', 'sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('65c37ae0-34dd-4e22-b347-43ec2e18dbb8', '772f8539-86db-425b-8f93-dbafb4ae3417', 'შექმნა', 'Shekmna', 'shekmna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1a5a89aa-f4e9-44e2-9b19-ea6ff2be81b2', '16067065-1c04-4fb3-97dd-06d7b3bc35f5', 'ბიზნეს ტურები', 'Biznes Turebi', 'biznes-turebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('84868ba8-89e0-44c1-b000-ae8053fcd441', '16067065-1c04-4fb3-97dd-06d7b3bc35f5', 'შიდა ტურიზმი', 'and', 'shida-turizmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('79065036-0640-42ad-a6d5-0b646dab5f1f', 'cb4ed1a2-5632-492f-ac46-6f2b8ce91d15', 'დივანი', 'Divani', 'divani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8e335545-4605-4127-919b-e346d891a840', 'cb4ed1a2-5632-492f-ac46-6f2b8ce91d15', 'კუთხის დივანი', 'Kutkhis Divani', 'kutkhis-divani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0aee9ed7-0f47-4a40-bd3d-ca9f9c70c493', 'cb4ed1a2-5632-492f-ac46-6f2b8ce91d15', 'პუფი', 'Pupi', 'pupi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8d7f423d-59d6-4560-a0d7-3828a1b093ad', 'cb4ed1a2-5632-492f-ac46-6f2b8ce91d15', 'სავარძელი', 'Savardzeli', 'savardzeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8568e85b-9830-4c3d-8c7f-04aaedf91128', 'cb4ed1a2-5632-492f-ac46-6f2b8ce91d15', 'სამეული', 'Sameuli', 'sameuli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f303018d-45d9-499b-b529-087fa78f9c6b', 'cb4ed1a2-5632-492f-ac46-6f2b8ce91d15', 'სარწეველა სავარძელი', 'Sartsevela Savardzeli', 'sartsevela-savardzeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a07b8be2-88ae-439c-b4e1-9869ca6ee1b0', '3749a591-9ab4-4086-b797-ee15c5781d85', 'შინშილა', 'Shinshila', 'shinshila', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('42819ec8-76fd-4dc4-b498-b1f9d4b9d349', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', ' მშენებლობა', 'Mshenebloba', 'mshenebloba', '🔨', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('434d121f-5ad4-467f-a902-51bceebf2f1d', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'ბუხრის დამზადება რესტავრაცია', 'and', 'bukhris-damzadeba-restavratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d7df8e6e-11f1-4a80-830f-8b0da505d3d2', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'გათბობა, კონდიცირება, ვენტილაცია', 'Gatboba Konditsireba Ventilatsia', 'gatboba-konditsireba-ventilatsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('56d79efd-9427-450e-956e-8a4ded4ea1e3', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'გამწვანება', 'Gamtsvaneba', 'gamtsvaneba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('16d119f5-43b8-40ca-8122-643354bd1bb2', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'ელექტრო-სამონტაჟო მომსახურება', 'Services', 'elektro-samontazho-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dac671af-54df-416d-b553-db66d7fa73ae', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'იატაკის დაგება, მოპირკეთება, მოხვეწა', 'and', 'iatakis-dageba-mopirketeba-mokhvetsa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f716cc70-704a-4e3a-b006-d50e981a4783', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'იზოლაციები', 'Izolatsiebi', 'izolatsiebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2738a523-6ef6-4ec6-94d6-1968e3558888', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'კარ-ფანჯარა, ჟალუზები, ღობეები', 'Kar Panjara Zhaluzebi Ghobeebi', 'kar-panjara-zhaluzebi-ghobeebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('10385a0f-d711-4433-b645-2c38da7de277', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'კაფელ-მეთლახის დაგება', 'and', 'kapel-metlakhis-dageba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0857836f-8336-45b7-9ccd-8eece372ce68', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'ლითონნაკეთობის დამზადება', 'and', 'litonnaketobis-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e959f354-a45a-49e5-bf0c-47b91a3e290b', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'მოპირკეთება', 'Mopirketeba', 'mopirketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5af679ce-89d7-46a1-85ef-43fa522739bc', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'საბურღი სამუშაოები', 'Saburghi Samushaoebi', 'saburghi-samushaoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e1cf171c-806e-4a9b-828d-01f0ddaecc8c', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'სადურგლო სამუშაოები', 'Sadurglo Samushaoebi', 'sadurglo-samushaoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('25626508-c427-44da-8cd0-3d5c4e533655', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'სამღებრო სამუშაოები', 'Samghebro Samushaoebi', 'samghebro-samushaoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c830bd09-0858-4925-a27f-8b29503a3871', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'სანტექნიკური მომსახურება', 'Services', 'santeknikuri-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ce6ba52-ddd0-413a-9481-08cf2a3eb0ed', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'სრული სარემონტო მომსახურება', 'Services', 'sruli-saremonto-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8737ec56-9068-443d-befe-8d1ca55a57ef', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'ჭერი, გადახურვა', 'and', 'cheri-gadakhurva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cd124af7-a995-4264-a501-1b578599dc0f', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'ბეტონის დასხმა', 'and', 'betonis-daskhma', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d21ff136-64fa-4f6e-89bd-40e20d18b3c3', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'გარე ფასადების დამზადება / შეკეთება', 'and', 'gare-pasadebis-damzadeba-sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('66c37473-06cc-404f-ac2d-17c848dcbdd8', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'დემონტაჟი', 'Demontazhi', 'demontazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3aef7b8a-5768-4899-b527-171d403c713e', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'კიბის დამზადება, რესტავრაცია', 'and', 'kibis-damzadeba-restavratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aea4b850-7b53-4e76-b7e4-c88edbd53473', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'საბათქაშო სამუშაოები', 'Sabatkasho Samushaoebi', 'sabatkasho-samushaoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7da8d97e-2935-437a-af29-c7162779bd10', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'საგზაო სამუშაოები', 'Sagzao Samushaoebi', 'sagzao-samushaoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('581b1df2-99e1-4121-8fa8-209d4d738ece', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'სამშენებლო მასალების დამზადება', 'and', 'samsheneblo-masalebis-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('087cee20-5206-4fcc-b38c-59c69d57429e', 'b308c20f-0b44-40b0-9876-3c25d407cfe7', 'სამშენებლო-სარემონტო ხელსაწყოების შეკეთება', 'Samsheneblo Saremonto Khelsatsqoebis Sheketeba', 'samsheneblo-saremonto-khelsatsqoebis-sheketeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('745f0b2f-9524-4902-bfa1-f8b5d31f8817', '98a0486f-d62b-4fff-a53e-c7be4b4a623f', 'დამზადება', 'and', 'damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('68e16374-b2b7-47b3-a310-af961f6ea2df', '98a0486f-d62b-4fff-a53e-c7be4b4a623f', 'შეფასება', 'Shepaseba', 'shepaseba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e2955a1c-30c7-4459-a579-4ecd60ac877d', 'eef45b95-bcf9-4a5d-bb33-35196de1334e', 'იურისტის მომსახურება', 'Services', 'iuristis-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ead48e25-3970-4f16-8f9a-dce6ae9abbc1', 'eef45b95-bcf9-4a5d-bb33-35196de1334e', 'ნოტარიუსის მომსახურება', 'Services', 'notariusis-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3dc899d3-87d6-4c44-ad8c-58abe08cd948', 'eef45b95-bcf9-4a5d-bb33-35196de1334e', 'კერძო დეტექტივის მომსახურება', 'Services', 'kerdzo-detektivis-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa6c752d-3c11-4b0c-85a4-7a0b6052632e', '90d8c15b-2969-43a2-9c19-57622d1634af', 'ნაძვის ხე', 'Nadzvis Khe', 'nadzvis-khe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6b4d6f7d-7830-4e9e-8c75-fe10ce201941', '90d8c15b-2969-43a2-9c19-57622d1634af', 'ნაძვის ხის სათამაშოები', 'Nadzvis Khis Satamashoebi', 'nadzvis-khis-satamashoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b368b446-0219-41ed-80c2-de7c4644d8b1', '90d8c15b-2969-43a2-9c19-57622d1634af', 'საახალწლო განათება', 'Saakhaltslo Ganateba', 'saakhaltslo-ganateba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('376c6e93-ef0d-4d23-bfc4-8c6a705e028b', '90d8c15b-2969-43a2-9c19-57622d1634af', 'საახალწლო ნუგბარი', 'Saakhaltslo Nugbari', 'saakhaltslo-nugbari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('48424011-b32a-4fed-9b0a-fdac1c4091bc', '90d8c15b-2969-43a2-9c19-57622d1634af', 'ჩიჩილაკი', 'Chichilaki', 'chichilaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('273cca77-1c66-41ba-bcbf-9c50fbd74bd8', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'ანტი რადარი', 'and', 'anti-radari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c5a0e66-b686-40bd-90b9-3f0569ebd530', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'აუდიო დომოფონი', 'Audio Domoponi', 'audio-domoponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('407aa85e-bfe5-4736-b30b-212cf5595947', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'ვიდეო დომოფონი', 'Video Domoponi', 'video-domoponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('33701763-5989-4e3d-b513-83bda7d4d9be', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'ვიდეო მეთვალყურეობის სისტემა', 'Video Metvalqureobis Sistema', 'video-metvalqureobis-sistema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0369caab-43c4-4687-ad02-41958da9e4d4', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'კაბელიანი სიგნალიზაცია', 'Kabeliani Signalizatsia', 'kabeliani-signalizatsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ab1d651-9814-4ad9-8fa7-7503bf23cb32', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'მეტალოდეტექტორი', 'Metalodetektori', 'metalodetektori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a95be57a-a777-4a7e-acbf-bf92e0d8e052', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'უკაბელო სიგნალიზაცია', 'Ukabelo Signalizatsia', 'ukabelo-signalizatsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('78194464-7dbb-4ce5-a2ed-ba4f31bbe444', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'ფარული აუდიო-ვიდეო ჩამწერი', 'Paruli Audio Video Chamtseri', 'paruli-audio-video-chamtseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7df7c7da-ecf4-4000-96f0-4446bb52ab34', 'cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', 'დაშვების სისტემა', 'and', 'dashvebis-sistema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e3fa55b4-45ce-4d51-b749-9ac47aed76e5', '2d79751b-c945-4d6a-bfa4-18084e0a36a9', 'გასაბერი ბუშტები ', 'Gasaberi Bushtebi', 'gasaberi-bushtebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c4e7eed-5c17-4685-9fba-a68e26ef9d2d', '2d79751b-c945-4d6a-bfa4-18084e0a36a9', 'ფრანები', 'Pranebi', 'pranebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('14358e5d-ee43-4902-b3cd-7ae00d3657f3', '2d79751b-c945-4d6a-bfa4-18084e0a36a9', 'სადღესასწაულო დეკორაციის შექმნა', 'Sadghesastsaulo Dekoratsiis Shekmna', 'sadghesastsaulo-dekoratsiis-shekmna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ddac1e93-10a0-4943-8da7-474b22120178', 'bbf303ff-3f0e-4a24-85cd-d45a0bbda782', 'გრუმინგი', 'Grumingi', 'grumingi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5f96cf12-cf18-49fe-8e17-c47619ce9a31', 'bbf303ff-3f0e-4a24-85cd-d45a0bbda782', 'ვეტერინარული მომსახურება', 'Services', 'veterinaruli-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9a639c5f-2814-4451-8219-1ece02684861', 'bbf303ff-3f0e-4a24-85cd-d45a0bbda782', 'კინოლოგიური მომსახურება', 'Services', 'kinologiuri-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('613cd3d1-4bb2-4f80-bd18-bed57fa2157a', 'bbf303ff-3f0e-4a24-85cd-d45a0bbda782', 'ცხოველთა გასეირნების სერვისი', 'Tskhovelta Gaseirnebis Servisi', 'tskhovelta-gaseirnebis-servisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac044f44-152e-4aef-9b73-2137eaec7bee', 'bbf303ff-3f0e-4a24-85cd-d45a0bbda782', 'ცხოველთა სასტუმრო/თავშესაფარი', 'Tskhovelta Sastumro Tavshesapari', 'tskhovelta-sastumro-tavshesapari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8e5c9ad5-8528-483f-8a76-2a10313cf029', 'bbf303ff-3f0e-4a24-85cd-d45a0bbda782', 'აკვარიუმის/ტერარიუმის მოვლა', 'Akvariumis Terariumis Movla', 'akvariumis-terariumis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6b9a1a1f-006c-41b2-98ef-fc9502410fbc', 'bbf303ff-3f0e-4a24-85cd-d45a0bbda782', 'ცხენოსნობა', 'Tskhenosnoba', 'tskhenosnoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('75caf255-b04b-4149-8dab-12e290f4d4af', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'ინფორმაციული ტექნოლოგიები', 'Inpormatsiuli Teknologiebi', 'inpormatsiuli-teknologiebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('88121e97-eccb-471a-9e4e-41312460a542', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'მენეჯმენტი', 'Menejmenti', 'menejmenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9d4b1817-7eee-48d3-a3c6-6ac32985a825', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'მუსიკა, ცეკვა, ხელოვნება', 'Music', 'musika-tsekva-khelovneba', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cf9d297e-667e-49ab-9904-6f482040d772', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'რეპეტიტორები', 'Repetitorebi', 'repetitorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0572e7d1-50e5-4648-9117-738234d85989', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'სილამაზე, ჯანმრთელობა, სპორტი', 'Silamaze Janmrteloba Sporti', 'silamaze-janmrteloba-sporti', '⚽', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3700d144-ecd5-4757-bdce-000f1505c3ca', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'უცხო ენების კურსები', 'Utskho Enebis Kursebi', 'utskho-enebis-kursebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('49167006-5325-4234-91da-a6fb481672f5', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'ჭრა-კერვის კურსები', 'Chra Kervis Kursebi', 'chra-kervis-kursebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('940b2d0b-945f-4249-a710-e9f3037b5531', 'fbf700b8-334f-49d0-b54d-81ecca05b5c9', 'ხელობის შესწავლა', 'Khelobis Shestsavla', 'khelobis-shestsavla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fd8db2be-7cc4-422c-8684-5c384877eeac', 'b1b101ed-b39a-41c4-85f7-4bbab9b9a3c7', 'არასასკოლო სახელმძღვანელოები', 'Arasaskolo Sakhelmdzghvaneloebi', 'arasaskolo-sakhelmdzghvaneloebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2800cb82-72e8-46aa-94af-a4cc455b897f', 'b1b101ed-b39a-41c4-85f7-4bbab9b9a3c7', 'სასკოლო სახელმძღვანელოები', 'Saskolo Sakhelmdzghvaneloebi', 'saskolo-sakhelmdzghvaneloebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8425dfa1-f0ae-4f4b-a18f-379361d40cfc', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'ეგზოტიკური თევზი', 'Egzotikuri Tevzi', 'egzotikuri-tevzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cfaccb2f-4131-4e7d-87db-61a9ec0bafe7', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'ამფიბია', 'Ampibia', 'ampibia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('84107df1-a881-475a-848b-e1fb564c3e2a', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'ეგზოტიკური მწერი', 'Egzotikuri Mtseri', 'egzotikuri-mtseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2584ab1c-c3a8-49e6-ad9a-c0f2eb75425f', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'ობობასნაირი', 'Obobasnairi', 'obobasnairi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f3b5f466-1a40-4c4e-866c-484243655b73', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'უხერხემლო', 'Ukherkhemlo', 'ukherkhemlo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('074e1d35-cf27-4619-a1aa-131fa1ab1cb9', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'ძუძუმწოვარა', 'Dzudzumtsovara', 'dzudzumtsovara', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('09022897-a606-4c3e-95bc-3e4dccd642bd', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'ქვეწარმავლები', 'Kvetsarmavlebi', 'kvetsarmavlebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8cbaed0c-06ca-428b-bdf9-31ae9ba30be1', '2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', 'ეგზოტიკური ფრინველები', 'Egzotikuri Prinvelebi', 'egzotikuri-prinvelebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4e3b86a1-11db-4c46-b730-7d58645a76ad', '478483d0-f49a-4a6a-9138-d6896a85ab33', 'ავტომობილის დინამიკი', 'Avtomobilis Dinamiki', 'avtomobilis-dinamiki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('20e2ae09-726c-4ee0-85a5-178b26616486', '478483d0-f49a-4a6a-9138-d6896a85ab33', 'ავტომობილის მაგნიტოფონი (რესივერი)', 'Avtomobilis Magnitoponi Resiveri', 'avtomobilis-magnitoponi-resiveri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9c4626a3-5b93-4031-b756-1046beee291f', '478483d0-f49a-4a6a-9138-d6896a85ab33', 'ვიდეო რეგისტრატორი', 'Video Registratori', 'video-registratori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('76997d4b-508e-452d-a61e-f203cfabf3e7', '478483d0-f49a-4a6a-9138-d6896a85ab33', 'საბ-ვუფერი', 'Sab Vuperi', 'sab-vuperi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('406086ab-a2c4-4134-a585-3c6092724cc1', '478483d0-f49a-4a6a-9138-d6896a85ab33', 'სამონტაჟო აქსესუარი და მოწყობილობა', 'and', 'samontazho-aksesuari-da-motsqobiloba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('45b1cd0b-da4b-4bb3-92d9-20b71e927224', '478483d0-f49a-4a6a-9138-d6896a85ab33', 'ხმის გამაძლიერებელი', 'Khmis Gamadzlierebeli', 'khmis-gamadzlierebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2f83da49-8cc2-49b4-a3b8-ace713fe5343', '478483d0-f49a-4a6a-9138-d6896a85ab33', 'FM მოდულატორი', 'FM Modulatori', 'fm-modulatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac98ea5e-3302-43ec-af32-82d8de6a7335', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ავეჯის საწმენდი საშუალებები', 'Furniture', 'avejis-satsmendi-sashualebebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('20a133fe-59be-4a20-9907-ffa0a31f1674', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ელექტრო ტექნიკის საწმენდი საშუალება', 'Elektro Teknikis Satsmendi Sashualeba', 'elektro-teknikis-satsmendi-sashualeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cad0981c-6e33-4652-9940-fa4c9f88e499', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'იატაკის საწმენდი საშუალებები', 'Iatakis Satsmendi Sashualebebi', 'iatakis-satsmendi-sashualebebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ba08036-f793-4e91-a1bb-965422d2a6a3', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'მათეთრებელი და ლაქების ამომყვანი', 'and', 'matetrebeli-da-lakebis-amomqvani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('997e8d24-556c-43e5-9353-44ed6ae95868', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'მილის საწმენდი სითხე', 'Milis Satsmendi Sitkhe', 'milis-satsmendi-sitkhe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9a49da6c-b178-4f42-96ac-66167188ce8d', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'მინის საწმენდი', 'Minis Satsmendi', 'minis-satsmendi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('86c84c5e-99d2-4e79-9380-b1c23580ae46', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ნაგვის ურნა/პარკი', 'Nagvis Urna Parki', 'nagvis-urna-parki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb4bccdb-e5d7-4a6b-9bc4-545b05cc45ad', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'სადეზინფექციო ხსნარი/აპარატი', 'Sadezinpektsio Khsnari Aparati', 'sadezinpektsio-khsnari-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e9daedb4-dacf-49ce-be00-0cee1862146f', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'სარეცხი საშუალებები', 'Saretskhi Sashualebebi', 'saretskhi-sashualebebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6b914234-979d-4b4f-a189-151b3ee62302', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'საწმენდი (სახეხი) საშუალებები', 'Satsmendi Sakhekhi Sashualebebi', 'satsmendi-sakhekhi-sashualebebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('268a1af1-5f78-43c6-bdf1-2eacd615f1b8', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ჭურჭლის სარეცხი საშუალებები', 'Churchlis Saretskhi Sashualebebi', 'churchlis-saretskhi-sashualebebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0b526111-69ef-4287-9aef-2dd32f1af7be', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ჰაერის არომატიზატორი', 'Haeris Aromatizatori', 'haeris-aromatizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('85cf95ce-95c0-4a63-b303-cd8401d6b320', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ბახილები/ბახილების აპარატი', 'Bakhilebi Bakhilebis Aparati', 'bakhilebi-bakhilebis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('69e5493c-239c-4c8f-a3b0-b29cf532f448', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'დეზობარიერი', 'Dezobarieri', 'dezobarieri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e26fb262-c595-459b-931b-7f6a0ec09acf', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ერთჯერადი ცელოფნები/პარკები', 'Ertjeradi Tselopnebi Parkebi', 'ertjeradi-tselopnebi-parkebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0429c2c3-b3c8-4e4e-b3c9-ca28ede4c1e3', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ვაკუუმის ჩანთები/ცელოფნები', 'Vakuumis Chantebi Tselopnebi', 'vakuumis-chantebi-tselopnebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f1cfbbba-6e0f-4351-89ec-d69de5c0cb49', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'კედლის ფილების საწმენდი საშუალება', 'Kedlis Pilebis Satsmendi Sashualeba', 'kedlis-pilebis-satsmendi-sashualeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('675fb69d-473e-43da-88be-841b02d39712', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ლატექსის ხელთათმანი', 'Lateksis Kheltatmani', 'lateksis-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4f867274-2bb7-46b6-ae03-e52e3e8b6bac', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'მილების სატუმბი ', 'Milebis Satumbi', 'milebis-satumbi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5a5a3b14-971f-4a17-8cc5-c1cca7ff798b', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ნესტის საწინააღმდეგო სითხე', 'Nestis Satsinaaghmdego Sitkhe', 'nestis-satsinaaghmdego-sitkhe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ad746ec5-2e07-4f8c-9947-02f57f2d9cfd', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ორგანაიზერი/კალათა', 'Organaizeri Kalata', 'organaizeri-kalata', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('14a5310e-16d3-4baa-901d-5901c9c20b6b', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'სარეცხის კალათა', 'Saretskhis Kalata', 'saretskhis-kalata', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1e818e01-be81-4230-a982-b4446811f0f4', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'სასცენო ეფექტების ქიმია', 'Sastseno Epektebis Kimia', 'sastseno-epektebis-kimia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7b4e5730-5763-49f6-9bcf-4d57a5cab8b1', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'სველი ხელსახოცი', 'Sveli Khelsakhotsi', 'sveli-khelsakhotsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('077593ce-03e6-4bbf-87ef-4c1b9fc1af19', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ქაღალდის დისპენსერი', 'Kaghaldis Dispenseri', 'kaghaldis-dispenseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c658639-c4d9-41ce-825b-7b687936e4d5', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ცოცხი და აქანდაზი', 'and', 'tsotskhi-da-akandazi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ebdc1827-53a0-45f8-87b9-283ebb3420a3', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'ჯარგისი/მოპი/ტილო', 'Jargisi Mopi Tilo', 'jargisi-mopi-tilo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'b0249a47-2769-4533-911b-0fc80db5b75d', 'აბაზანა/საპირფარეშოს აქსესუარები', 'Abazana Sapirpareshos Aksesuarebi', 'abazana-sapirpareshos-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('699dda8d-899c-4939-852b-dd2e6278d24b', 'e31f3d79-d497-4526-959a-6428c057c492', 'დამხმარე ხელსაწყოები', 'and', 'damkhmare-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bca2e098-0601-4eb5-b209-3b582b55190c', 'e31f3d79-d497-4526-959a-6428c057c492', 'პასიური კომპონენტები', 'Pasiuri Komponentebi', 'pasiuri-komponentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'e31f3d79-d497-4526-959a-6428c057c492', 'აქტიური კომპონენტები', 'Aktiuri Komponentebi', 'aktiuri-komponentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bda27e9c-e225-488b-b8aa-ba3ac542cbf5', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'ბლოკსქემები', 'Blokskemebi', 'blokskemebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aeec84a5-b63b-466e-b363-95ad2b4a393d', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'დამცავი ელემენტები', 'and', 'damtsavi-elementebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba325bf9-5005-4d65-994b-2bd38f2d6308', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'დამცველები', 'and', 'damtsvelebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('765eba36-465f-4cf3-8222-65de6b28d21d', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'დიოდები', 'Diodebi', 'diodebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e583da49-6e59-4b7a-b49b-4dfeb614e34a', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'თბო-ელემენტი', 'Tbo Elementi', 'tbo-elementi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e9002021-4259-4ed8-90f5-beef5c921bde', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'ინდიკატორები', 'Indikatorebi', 'indikatorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e256e6cf-084e-4aba-b444-51e93c2bc90b', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'მიკროსქემები', 'Mikroskemebi', 'mikroskemebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4d77347d-0e25-46e2-9b78-209f92734af6', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'ოპტრონები', 'Optronebi', 'optronebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7653f801-eaf4-4474-9ea3-ee4a1a2dc237', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'რადიოლამფები', 'Radiolampebi', 'radiolampebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7fd517ec-90c2-4067-b6aa-7e790543e2fc', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'სენსორები და გადამწოდები', 'and', 'sensorebi-da-gadamtsodebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b577ef0a-38f4-46b4-8468-1bc2d0bf904a', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'სტაბილიტრონები', 'Stabilitronebi', 'stabilitronebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2faf2cf6-8753-4a3c-b007-205f517fffe6', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'ტირისტორები და სიმისტორები', 'and', 'tiristorebi-da-simistorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e30de8a-62d2-487e-bbf6-eacc03a11591', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'ფოტოელემენტები', 'Potoelementebi', 'potoelementebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f2ea5e44-4e69-4113-b04a-bcda543395a7', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'შუქდიოდები', 'Shukdiodebi', 'shukdiodebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('34386714-7955-4c9a-8bfa-162545853e2d', 'eb7b75a6-f866-4f67-9ef0-cc28cec16bfa', 'ტრანზისტორები', 'Tranzistorebi', 'tranzistorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1de9e8da-0e46-46ae-acac-9ea51e3b65c6', '34386714-7955-4c9a-8bfa-162545853e2d', 'IGBT', 'IGBT', 'igbt', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1d78e97f-20c9-459f-ba07-39f5e3315eb6', '34386714-7955-4c9a-8bfa-162545853e2d', 'SMD', 'SMD', 'smd', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aad1edc8-1fa6-4d0c-b493-af4b7f35e460', '34386714-7955-4c9a-8bfa-162545853e2d', 'ბიპოლარული', 'Bipolaruli', 'bipolaruli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2e23fe6e-e971-4d3c-bb80-0a86da0f664c', '34386714-7955-4c9a-8bfa-162545853e2d', 'ველის', 'Velis', 'velis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9327cb88-bc5e-4011-a8d8-729a858d748e', 'bca2e098-0601-4eb5-b209-3b582b55190c', ' ტრანსფორმატორები', 'Transpormatorebi', 'transpormatorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c89aa101-374b-4fdb-b4cd-e6c1bfb5a2f7', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'კონდენსატორები', 'Kondensatorebi', 'kondensatorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c95cb8f4-ae8a-4896-bfc8-00f2ff916f8b', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'რადიატორები', 'Radiatorebi', 'radiatorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b8cb5ff6-28b8-4637-b3ea-814575a861cc', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'რეზისტორები', 'Rezistorebi', 'rezistorebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('23d3b745-1c3e-4889-872f-97281afa84a7', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'რელეები', 'Releebi', 'releebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0b9e7f34-f3e9-4a3a-aee5-881b6f04d61a', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'სადენები', 'Sadenebi', 'sadenebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('44dd20ba-92d5-409c-b44d-d86c6f6dbc87', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'საიზოლაციო მასალა', 'Saizolatsio Masala', 'saizolatsio-masala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c5f1dcfc-38d2-46c2-9822-16fbe57d6aa8', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'შემაერთებლები', 'Shemaerteblebi', 'shemaerteblebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('765d48d3-bab5-401c-ab88-108f71044038', 'bca2e098-0601-4eb5-b209-3b582b55190c', 'ჩამრთველები', 'Chamrtvelebi', 'chamrtvelebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('673dc5ab-fe3e-48be-96d7-77ad8750e607', '699dda8d-899c-4939-852b-dd2e6278d24b', 'საზომი ხელსაწყოები', 'Sazomi Khelsatsqoebi', 'sazomi-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ead6c7f8-4ef0-449c-8d9d-e618349e5764', '699dda8d-899c-4939-852b-dd2e6278d24b', 'სახარჯი მასალები', 'Sakharji Masalebi', 'sakharji-masalebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c26e2a5b-f620-4d47-9f18-a2f5748e9188', '699dda8d-899c-4939-852b-dd2e6278d24b', 'ხელსაწყოები', 'Khelsatsqoebi', 'khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9eed4cbf-3a9d-4abe-9fa5-d2334a608c45', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'ავტომობილების გაქირავება', 'Rent', 'avtomobilebis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3318fabe-b5dd-4a04-8eb1-8ea824d920a2', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'კომპიტერული ტექნიკის გაქირავება', 'Rent', 'kompiteruli-teknikis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b49edd84-000c-4841-a973-9bb1e97b3426', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'სპეცტექნიკის გაქირავება', 'Rent', 'spetsteknikis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('53949d11-2648-44f5-80bc-5e272bb90f79', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'ავეჯი, ინტერიერი, ჭურჭლის გაქირავება', 'Rent', 'aveji-interieri-churchlis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f120b426-d436-44c6-bbdf-3a001d9ec5d4', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'არქეოლოგიური აღჭურვილობის გაქირავება', 'Rent', 'arkeologiuri-aghchurvilobis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('010c6a3a-ff82-4d57-9770-2ddb16cee738', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'ბიზნესის და ბიზნეს-დანადგარების გაქირავება', 'Rent', 'biznesis-da-biznes-danadgarebis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8d8b959b-c68b-43a2-af40-fcd104f2d597', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'დალაგება / დასუფთავების ინვენტარის გაქირავება', 'Rent', 'dalageba-dasuptavebis-inventaris-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1832235a-25fe-4936-b3a4-7ec205ba3a41', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'ეზოს ინვენტარის გაქირავება', 'Rent', 'ezos-inventaris-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bc4d109e-e0be-40b8-807e-8bab701a5d55', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'ველოსიპედის გაქირავება', 'Rent', 'velosipedis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8af5359d-e3e8-415a-ac0d-18d875c85acf', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'მოტოტექნიკის გაქირავება', 'Rent', 'mototeknikis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('526d64e0-ee62-4d9a-8634-530fdeaf69ee', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'მუს. აპარატურის გაქირავება', 'Rent', 'mus-aparaturis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a242190b-f5c3-488f-bb1a-4ebba0072106', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'სადღესასწაულო ინვენტარის გაქირავება', 'Rent', 'sadghesastsaulo-inventaris-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f1f13a4f-64ea-4127-ae7e-fcefebb782ed', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'საკომუნიკაციო აღჭურვილობის გაქირავება', 'Rent', 'sakomunikatsio-aghchurvilobis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('39f8f0e3-a6d0-48f7-9f50-ba3239c13247', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'სამედიცინო ინვერტარის გაქირავება', 'Rent', 'sameditsino-invertaris-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('20a2e61a-e64f-4ca0-9967-d042d2edd8ff', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'სამშენებლო-სარემონტო ინვენტარის გაქირავება', 'Rent', 'samsheneblo-saremonto-inventaris-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4cddc922-408f-4a87-ae82-eec282ed1b10', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'სპორტული და სალაშქრო აღჭურვილობის გაქირავება', 'Rent', 'sportuli-da-salashkro-aghchurvilobis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c2463477-ce5b-4a60-82af-4b61f6007ecc', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'ტანსაცმლის და აქსესუარების გაქირავება', 'Rent', 'tansatsmlis-da-aksesuarebis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bc836074-8b2f-4890-a9da-07e7c16d7511', '412b1bff-50b6-4996-8d73-d48f8435d60d', 'ფოტო-ვიდეო აპარატურის გაქირავება', 'Rent', 'poto-video-aparaturis-gakiraveba', '🏡', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bc79bc68-fd52-4e45-823f-b7bcfbf598ba', '131f607a-07f9-4d2d-ad3c-d0b5f8f98d67', 'სათამაშო კონსოლები/კონტროლერები', 'Satamasho Konsolebi Kontrolerebi', 'satamasho-konsolebi-kontrolerebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a974f398-43bb-4a2c-9c4b-765b4706dce0', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ხელოვნური ყვავილები და დეკორაციები', 'and', 'khelovnuri-qvavilebi-da-dekoratsiebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('94704310-95c9-43db-acbe-ed7b7bf1a9a0', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'სადღესასწაულო', 'Sadghesastsaulo', 'sadghesastsaulo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('61ccd87a-d0f8-45e8-9d57-0479098b40f1', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ინტერიერი', 'Interieri', 'interieri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('531986db-322b-4dd5-b4cd-0fbd4513d937', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ბაღი და ბაღის აქსესუარები', 'and', 'baghi-da-baghis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('79360bcb-906b-4d87-89a9-4cfe0eacafb6', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ეზოს ინვენტარი', 'Ezos Inventari', 'ezos-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('71b5d2ed-fab2-4787-acef-6389a5afa2b7', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ტექსტილი და თეთრეული', 'and', 'tekstili-da-tetreuli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dabc4eed-2365-42f0-a6b4-9e7a87ba8f5e', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ავეჯი', 'Furniture', 'aveji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('668888c3-1dd1-4e5f-999d-7e8a26c49fd7', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ჭურჭელი და სამზარეულოს აქსესუარები', 'Dishes', 'churcheli-da-samzareulos-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('87b858c6-c38d-417c-984b-8c74b8cf6313', 'd55a7743-2b7e-4ab6-8e7b-8fa0d1ec6da0', 'მუსიკალური დისკი', 'Music', 'musikaluri-diski', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ddf00e02-df6e-49c1-a9ef-8ef1baf8d690', 'd55a7743-2b7e-4ab6-8e7b-8fa0d1ec6da0', 'მუსიკალური ფირფიტა', 'Music', 'musikaluri-pirpita', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eaff699d-250e-42a1-8611-3920ed5f33c3', 'd55a7743-2b7e-4ab6-8e7b-8fa0d1ec6da0', 'მუსიკალური ფირი (აუდიოკასეტა)', 'Music', 'musikaluri-piri-audiokaseta', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('55e80d07-7271-4bff-8f4f-33232e100481', '1146af06-88bb-4260-8b60-ebe56dad1584', 'მოძრავი კვების ობიექტი', 'Modzravi Kvebis Obiekti', 'modzravi-kvebis-obiekti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7026e25e-f491-4076-8d95-0915b17a6a8e', '1146af06-88bb-4260-8b60-ebe56dad1584', 'კვების პროდუქტის დანადგარი ', 'and', 'kvebis-produktis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('644bdbd3-ea1a-4595-bda3-8c6cb1ee2eab', '591ac6de-56ee-4b72-9a85-f911b2572385', 'ძაღლი', 'Dzaghli', 'dzaghli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8d5820ad-a713-4ee6-ad3e-382df314ad11', '61ccd87a-d0f8-45e8-9d57-0479098b40f1', 'დეკორატიული აქსესუარები', 'Dekoratiuli Aksesuarebi', 'dekoratiuli-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b65fc255-36d8-45a4-bdf0-b4d2c62b1871', '61ccd87a-d0f8-45e8-9d57-0479098b40f1', 'ბუხარი', 'Bukhari', 'bukhari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5dcdd09f-5c2e-4afc-b7a4-6cdacd133553', '61ccd87a-d0f8-45e8-9d57-0479098b40f1', 'ოთახის საათი', 'Watch', 'otakhis-saati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('90984f77-6d7d-45e1-9ecf-49b442935f55', '61ccd87a-d0f8-45e8-9d57-0479098b40f1', 'სარკე', 'Sarke', 'sarke', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('07cf8271-11a7-4e0b-9540-278ea49b950a', '61ccd87a-d0f8-45e8-9d57-0479098b40f1', 'ხალიჩა/ნოხი', 'Carpet', 'khalicha-nokhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('22d0bf97-a52f-4750-a342-149eaff9d4a6', '61ccd87a-d0f8-45e8-9d57-0479098b40f1', 'საუთოვებელი დაფა', 'and', 'sautovebeli-dapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b4d14564-944c-4fd5-8e3f-4ae294b2ccff', '61ccd87a-d0f8-45e8-9d57-0479098b40f1', 'ტანსაცმლის საშრობი ', 'Tansatsmlis Sashrobi', 'tansatsmlis-sashrobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('33510e9c-1f44-4d37-b1c0-c343be6fad55', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'ამინომჟავა', 'Aminomzhava', 'aminomzhava', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('415e1da9-3d50-4e0c-a505-77dfd605c271', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'ანაბოლიკი', 'Anaboliki', 'anaboliki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('23f8ecff-7a28-4ebb-a036-77ba7b203113', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'გეინერი', 'Geineri', 'geineri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b22ccad3-7171-440f-90dd-468bbb647e75', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'ენერგეტიკი', 'Energetiki', 'energetiki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e5b266a0-2cfe-4d0a-a8e8-0b67bd7baf1e', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'ერთჯერადი', 'Ertjeradi', 'ertjeradi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('78795e2e-662b-436f-b282-74453cd7a725', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'ვიტამინი', 'Vitamini', 'vitamini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02060539-a638-415d-b8ce-56a488f1e6d6', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'პროტეინი', 'Proteini', 'proteini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f09f1a31-1dbd-4479-af7d-51b3c7ab94e0', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'სახსრების ჯანმრთელობა', 'Sakhsrebis Janmrteloba', 'sakhsrebis-janmrteloba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('297a067c-d9b2-426d-bc9e-ac3af2840150', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'ცხიმისმწველი', 'Tskhimismtsveli', 'tskhimismtsveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b4c4cd25-c7a5-46ab-9f91-d43d52832195', 'dbefb0e7-9bdc-4021-8a6b-6636a04d1499', 'ჯანსაღი საკვები', 'Jansaghi Sakvebi', 'jansaghi-sakvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bcbb9479-9a08-48bf-96bb-0c981c94cf19', '94704310-95c9-43db-acbe-ed7b7bf1a9a0', 'თაიგული', 'Taiguli', 'taiguli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7f8f4c77-4d41-40f9-993e-a45507db48f3', '94704310-95c9-43db-acbe-ed7b7bf1a9a0', 'სააღდგომო ნივთები', 'Items', 'saaghdgomo-nivtebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('146c30dd-7ce5-4aee-ae8a-19a9c40ac795', '94704310-95c9-43db-acbe-ed7b7bf1a9a0', 'სხვანაირი საჩუქარი', 'Skhvanairi Sachukari', 'skhvanairi-sachukari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('383acd33-1b75-4678-bf85-9d35ad84a02a', '8d2d1b58-bda6-4c26-8c56-2f5aa628ef7f', 'ავეჯის/ინტერიერის დიზაინი', 'Furniture', 'avejis-interieris-dizaini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('22e9ba5e-7934-4c65-b827-67d2fc988ba8', '8d2d1b58-bda6-4c26-8c56-2f5aa628ef7f', 'აზომვითი ნახაზები', 'Azomviti Nakhazebi', 'azomviti-nakhazebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('39f923a4-cc29-4d3c-aca4-86d623a94010', '8d2d1b58-bda6-4c26-8c56-2f5aa628ef7f', 'არქიტექტურა', 'Arkitektura', 'arkitektura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('064f4fdb-4f53-4aa1-ac91-a8e87ad2ec79', '8d2d1b58-bda6-4c26-8c56-2f5aa628ef7f', 'ლანდშაფტის დიზაინი', 'Landshaptis Dizaini', 'landshaptis-dizaini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb024da7-b006-4c7b-ad8a-41b6bf08ef2e', '8d2d1b58-bda6-4c26-8c56-2f5aa628ef7f', 'პროექტირება/საპროექტო დოკუმენტაციის მომზადება', 'Proektireba Saproekto Dokumentatsiis Momzadeba', 'proektireba-saproekto-dokumentatsiis-momzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0beb6be2-99c3-4d5c-93ce-89f4da202fd9', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'დამცავი სათვალე', 'and', 'damtsavi-satvale', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ef1607da-2e9c-445f-9149-f9a1078255c6', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'რესპირატორი/ნიღაბი/აირწინაღი', 'Respiratori Nighabi Airtsinaghi', 'respiratori-nighabi-airtsinaghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('be89480e-3879-45bd-b02c-5a86d615e2ce', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'სამუშაო ხელთათმანი', 'Samushao Kheltatmani', 'samushao-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dd66b412-bd1b-423d-a539-010ee381145c', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'სამშენებლო მოაჯირი/ღობე', 'Samsheneblo Moajiri Ghobe', 'samsheneblo-moajiri-ghobe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('888680b7-08b9-4e1c-aa0c-ba7c8690f829', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'სამშენებლო ჩაფხუტი', 'Samsheneblo Chapkhuti', 'samsheneblo-chapkhuti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ed0bd0bc-1e8e-42e3-a232-071f0809e12e', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'საწვიმარი ლაბადა', 'and', 'satsvimari-labada', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ddb10c6-ee80-47ca-950d-2d5edc2e549d', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'უნიფორმა', 'Uniporma', 'uniporma', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a27a46b4-c410-4be1-8b7a-5323111a956f', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'უსაფრთხოების ქამრები', 'Usaprtkhoebis Kamrebi', 'usaprtkhoebis-kamrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8b760413-273d-440c-ab7d-c270570dfab3', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'უსაფრთხოების/საგზაო ნიშნები', 'Usaprtkhoebis Sagzao Nishnebi', 'usaprtkhoebis-sagzao-nishnebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8c96fdc2-9e17-439b-bfe4-48b37734c2ce', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'ფანარი', 'Panari', 'panari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8b58f41e-4587-4e70-ad91-6bd548a802d8', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'შემდუღებლის ნიღაბი/სათვალე', 'Shemdugheblis Nighabi Satvale', 'shemdugheblis-nighabi-satvale', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d3e94914-6b58-49c7-86d9-ae6e5f380302', 'db2dfb2b-c322-4d11-863c-2979d08c89c1', 'ხმის დამხშობი', 'and', 'khmis-damkhshobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5f7510dd-8168-48f4-ba42-dd008a1323c6', 'e871fb0f-915f-4186-828a-ea41126c70e4', 'ავეჯის სადგამები და გორგოლაჭები', 'Furniture', 'avejis-sadgamebi-da-gorgolachebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9afe299e-37b1-4b39-9a7a-38c512b5d3ae', 'e871fb0f-915f-4186-828a-ea41126c70e4', 'ანჯამი', 'Anjami', 'anjami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba7a7c89-dfb4-46d3-afb5-c2f8be4aa61c', 'e871fb0f-915f-4186-828a-ea41126c70e4', 'კარის მექანიზმი', 'Karis Mekanizmi', 'karis-mekanizmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dababdf5-c057-4d14-bbc4-24ac29cfa76d', 'e871fb0f-915f-4186-828a-ea41126c70e4', 'კარის სახელური', 'Karis Sakheluri', 'karis-sakheluri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('45884904-e528-41af-9d8a-e12c65388ed6', 'e871fb0f-915f-4186-828a-ea41126c70e4', 'საკეტები და დამჭერები', 'and', 'saketebi-da-damcherebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4a9276fa-2cb2-414c-857f-cafdf6896962', 'e871fb0f-915f-4186-828a-ea41126c70e4', 'საკიდი', 'Sakidi', 'sakidi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6f7566b5-8971-4210-a309-0f0c829f7882', 'e871fb0f-915f-4186-828a-ea41126c70e4', 'უჯრის მექანიზმი', 'Ujris Mekanizmi', 'ujris-mekanizmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'bcd83a10-a8aa-4644-b379-d4d44e099cf5', 'ელექტრო/პნევმატური ხელსაწყოები', 'Elektro Pnevmaturi Khelsatsqoebi', 'elektro-pnevmaturi-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('19065ce3-3680-43d8-9e4e-7887d9212f12', 'bcd83a10-a8aa-4644-b379-d4d44e099cf5', 'მექანიკური ხელსაწყოები', 'Mekanikuri Khelsatsqoebi', 'mekanikuri-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7e3e0eee-52b2-4cae-9542-7c7d3e9bbeb5', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'არმატურის შესაკრავი ხელსაწყო', 'Armaturis Shesakravi Khelsatsqo', 'armaturis-shesakravi-khelsatsqo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fc9de96f-8117-4300-bad5-19d8e1cb2740', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ბეტონის შემრევი/მიქსერი', 'Betonis Shemrevi Mikseri', 'betonis-shemrevi-mikseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('05a70ca2-fee1-4c99-aac6-9c3966a722e5', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'გეოდეზიური ხელსაწყოები', 'Geodeziuri Khelsatsqoebi', 'geodeziuri-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e81c92b9-9159-4cac-9dd0-c0c820842709', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო ბურღი', 'Elektro Burghi', 'elektro-burghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b3437fd1-1135-4a58-add5-9ff971d8b94c', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო საზომი ხელსაწყოები', 'Elektro Sazomi Khelsatsqoebi', 'elektro-sazomi-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('227a57d0-926d-472d-83bf-9d88b7e0214a', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო სალესი', 'Elektro Salesi', 'elektro-salesi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2072837a-4718-49af-8d80-c670e25ab5cb', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო ხელსაწყოს ელემენტი', 'Elektro Khelsatsqos Elementi', 'elektro-khelsatsqos-elementi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('baac57ae-1b38-4f96-973f-a7f265d6a298', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო ხერხი', 'Elektro Kherkhi', 'elektro-kherkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4f58a7bd-437a-4b64-8fab-1290216e7a50', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო ხრახნდამჭერი', 'and', 'elektro-khrakhndamcheri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('48994378-f8c7-4452-9602-c535c46a1bff', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო ჯალამბარი, ტელფერი', 'Elektro Jalambari Telperi', 'elektro-jalambari-telperi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b057394e-fc3f-424f-a7ea-2c147abf1be8', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ელექტრო/პნევმატური ქანჩდამჭერი', 'and', 'elektro-pnevmaturi-kanchdamcheri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('736f1ea7-219e-4e89-b29b-e8a2767ff285', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'თერმოპისტოლეტები, ტექნიკური ფენი', 'Termopistoletebi Teknikuri Peni', 'termopistoletebi-teknikuri-peni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ac4353d-3910-4bfb-9c85-335feea68024', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'იატაკის მოსახვეწი აპარატი', 'Iatakis Mosakhvetsi Aparati', 'iatakis-mosakhvetsi-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa47a593-30a2-4135-8153-4671a15825c7', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'კემპი/შედუღების აპარატი', 'Kempi Shedughebis Aparati', 'kempi-shedughebis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e0070986-a69d-4aae-a904-a0adcf6ab9a4', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'კომპრესორი', 'Kompresori', 'kompresori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7e54a73b-6e18-4899-a9d4-34092188c5e5', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'კუთხესახეხი', 'Kutkhesakhekhi', 'kutkhesakhekhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('172ec011-9a3f-4f64-bcd1-e31c74136807', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ლითონის საჭრელი', 'Litonis Sachreli', 'litonis-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('08911e2b-2af4-4e41-bde6-751b48d42060', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ლურსმნის თოფი/ სტეპლერი', 'Lursmnis Topi Stepleri', 'lursmnis-topi-stepleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('16817ade-97af-45d8-81f4-20b51675ee1e', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'მულტიფუნქციური ხელსაწყო, ბორმანქანა', 'Multipunktsiuri Khelsatsqo Bormankana', 'multipunktsiuri-khelsatsqo-bormankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c9e94a93-ec41-4216-bdba-b2d477fa7afd', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ნიველირი', 'Niveliri', 'niveliri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('67a519ff-cb80-4569-8e47-f13a0b5f9735', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'პერფორატორი/სადემონტაჟო ჩაქუჩი', 'Perporatori Sademontazho Chakuchi', 'perporatori-sademontazho-chakuchi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4baca4f0-1789-4db4-b8c9-ecc1b7efe78a', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'პლაზმური ჭრის აპარატი', 'Plazmuri Chris Aparati', 'plazmuri-chris-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('df709081-7ecb-4fff-a63e-ffc1052c2cdf', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'პოლირების აპარატი', 'Polirebis Aparati', 'polirebis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('df5c47f3-4fc0-4dc6-96b5-a23198915fae', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'პულივიზატორი', 'Pulivizatori', 'pulivizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('715ac237-1a53-475a-8972-87f527311ccd', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'რკინაბეტონის საჭრელ საბურღი აპარატი', 'Rkinabetonis Sachrel Saburghi Aparati', 'rkinabetonis-sachrel-saburghi-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1df68548-75aa-411d-a4f5-cd6b6107bab2', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'სამშენებლო მტვერსასრუტი, ასპირატორი', 'Samsheneblo Mtversasruti Aspiratori', 'samsheneblo-mtversasruti-aspiratori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('63e15b87-2ab9-448d-ad5e-89f5727a1765', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'სანთურა', 'Santura', 'santura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('73c25392-082a-4221-a106-b7204146d42a', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'სარჩილავი', 'Sarchilavi', 'sarchilavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3f5f89af-42ca-498f-8a95-4b62ef9a8a3a', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'სახეხი/სარანდავი მანქანა', 'and', 'sakhekhi-sarandavi-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('514250f2-28e1-469c-8207-789cd6248941', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'სტერილიზატორი', 'Sterilizatori', 'sterilizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1eabfa4d-dce9-45f5-af73-4f89ed40683f', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ფრეზი, ბეწვახერხი', 'Prezi Betsvakherkhi', 'prezi-betsvakherkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5a2161ba-248a-4360-8566-f495f11b1c1b', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'შესადუღებელი უთო', 'Shesadughebeli Uto', 'shesadughebeli-uto', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6546a46e-6e1b-4276-8b83-5c8e3bc4a1fa', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'შესალესი აპარატი', 'Shesalesi Aparati', 'shesalesi-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('75eeeae0-3bad-402c-8f17-c8cdd5da632e', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ცირკულარული ხერხი', 'Tsirkularuli Kherkhi', 'tsirkularuli-kherkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c09f1f8-3f2a-44a5-abbf-5da93e571f82', '6e64be55-1bfb-4d09-81fb-11cab61a75e3', 'ხელსაწყოების სადგამი, მაგიდა, დაზგა ', 'and', 'khelsatsqoebis-sadgami-magida-dazga', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e57205f7-f8a7-400b-ba81-63c5d4feee8f', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ბრტყელტუჩა', 'Brtqeltucha', 'brtqeltucha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8dfe9765-6cfe-4969-bd0c-3d81f936eb0c', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ბუნიკის პრესი', 'Bunikis Presi', 'bunikis-presi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('01bd35a9-3f0f-4821-9122-53f600b1cc55', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'გირაგი/წნეხი', 'Giragi Tsnekhi', 'giragi-tsnekhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('98b67d5b-5748-49f5-968a-84b859882c9d', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'გონიო/სახაზავი', 'Gonio Sakhazavi', 'gonio-sakhazavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1d0032ce-0545-459d-96d3-29864dfaef40', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ვაკუუმური მინის დამჭერი', 'and', 'vakuumuri-minis-damcheri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0ce21ffe-d9f5-45a7-bd16-b764d0792c05', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'თარაზო', 'Tarazo', 'tarazo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('766d8e76-9d60-49e5-a188-446878db8901', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'კაფელ-მეტლახის საჭრელი', 'Kapel Metlakhis Sachreli', 'kapel-metlakhis-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('996ed1c4-4949-403c-b70c-5e8b98948ddf', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'კიბე', 'Kibe', 'kibe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4b7729d2-adf0-4da6-b1bd-982972f7b033', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ლითონსაჭრელი ხელის ხერხი', 'Litonsachreli Khelis Kherkhi', 'litonsachreli-khelis-kherkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f006baac-6874-4335-bbea-b61b5a9b474a', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მაფიქსირებელი მაგნიტი', 'Mapiksirebeli Magniti', 'mapiksirebeli-magniti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('848a88ae-9611-44fc-9ce7-085948b229e3', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მექანიკური ამწე/ჯალამბარი', 'Mekanikuri Amtse Jalambari', 'mekanikuri-amtse-jalambari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa93b83d-271f-4fec-b86b-d16fab2e65fb', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მექანიკური ბურღი', 'Mekanikuri Burghi', 'mekanikuri-burghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9eb15727-65ad-4f87-bb36-056cf63c89b7', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მექანიკური სალაშინი', 'Mekanikuri Salashini', 'mekanikuri-salashini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('963b96ba-9822-4587-8829-87f52908c7f6', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მექანიკური სახრახნისი', 'Mekanikuri Sakhrakhnisi', 'mekanikuri-sakhrakhnisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('440d3cf2-e0d8-422c-a305-5a929956597b', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მინის საჭრელი', 'Minis Sachreli', 'minis-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('98393892-eb09-434b-b923-125abbd1520b', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მკვნეტარა', 'Mkvnetara', 'mkvnetara', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('76909d42-b7bf-4e3d-ac7b-1ac69b30c49c', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მომჭერი/ფიქსატორი', 'Momcheri Piksatori', 'momcheri-piksatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a3debb4c-5c71-4391-b978-1100d08ae008', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'მოქლონვის ხელსაწყო', 'Moklonvis Khelsatsqo', 'moklonvis-khelsatsqo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('609bb11c-b927-4d2e-a631-a97a5ac9f8b8', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ნეოდიუმის მაგნიტები', 'Neodiumis Magnitebi', 'neodiumis-magnitebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('398a4d90-0fe6-46fd-8254-244fda7291ad', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'სადენის საფრცქვნელი', 'Sadenis Saprtskvneli', 'sadenis-saprtskvneli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a56056d9-a5cc-44c0-8d54-00967349c720', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'საზომი ლარტყა', 'Sazomi Lartqa', 'sazomi-lartqa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('559f1c8a-26de-4e19-a2cc-5bb0ae6c46b8', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'საზომი ლენტი/რგოლი', 'Sazomi Lenti Rgoli', 'sazomi-lenti-rgoli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1c243ecb-78ca-4d06-834d-103d864614c2', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'საკისარის ამოსაღები ხელსაწყო', 'Sakisaris Amosaghebi Khelsatsqo', 'sakisaris-amosaghebi-khelsatsqo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ce4d5ae-0478-4cad-8867-6d2295673399', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'სამონტაჟო სილიკონის თოფი', 'Samontazho Silikonis Topi', 'samontazho-silikonis-topi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('16f14329-b131-4bce-8d70-4b67d92d649e', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'სამღებრო ფუნჯი/ლილვაკი', 'Samghebro Punji Lilvaki', 'samghebro-punji-lilvaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b17142d9-a233-4443-8e31-baee85299659', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'სამშენებლო დანა', 'and', 'samsheneblo-dana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('72fdf69c-7ad4-4597-ba2f-58e4b2a074b3', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'სამშენებლო/სარემონტო მაკრატელი', 'Samsheneblo Saremonto Makrateli', 'samsheneblo-saremonto-makrateli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c488b14c-5659-4a57-8a23-ac1e839e188f', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'საპოხი ხელსაწყო', 'Sapokhi Khelsatsqo', 'sapokhi-khelsatsqo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7fcd3453-4fdf-49f0-b66e-3ccee8cd9797', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'სატეხი/ღოჯი', 'Satekhi Ghoji', 'satekhi-ghoji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7b260e3f-1e98-4db2-a1b6-e4de9ef246b2', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'საფხეკი', 'Sapkheki', 'sapkheki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa207d42-07b6-4c6a-9c1e-7c908e96a7bb', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'სტეპლერი/სახვრეტელა', 'Stepleri Sakhvretela', 'stepleri-sakhvretela', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bf9a307d-1653-4df0-ad3a-e19528594b30', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ქანჩის გასაღები', 'Kanchis Gasaghebi', 'kanchis-gasaghebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6324d5d-e322-4fd7-a598-41715d849d03', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ქანჩის თავაკი', 'Kanchis Tavaki', 'kanchis-tavaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('116b063f-e3cb-449d-95f1-00ddb3cc1d43', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ქაფჩა', 'Kapcha', 'kapcha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3a5b0535-2f10-49de-b413-8c132b8f4baf', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ქლიბი/სალესი ქვა', 'Klibi Salesi Kva', 'klibi-salesi-kva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3fed53b0-7b0e-46aa-a517-e5226b788cfd', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'შტანგენფარგალი', 'Shtangenpargali', 'shtangenpargali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('403653ee-b1c7-43f5-9b77-a66ade13ba81', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ჩაქუჩი/ურო', 'Chakuchi Uro', 'chakuchi-uro', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2e7c9558-bb2a-44d4-9e87-29663f59fc04', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ჭანჭიკსაჭრელი', 'Chanchiksachreli', 'chanchiksachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dee23b74-e026-4e1a-b55e-77cdcd06d909', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ხელსაწყოების ნაკრები', 'Khelsatsqoebis Nakrebi', 'khelsatsqoebis-nakrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('38368026-4456-4bdc-8c11-ebf6d27d74f0', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ხელსაწყოების ქამარი', 'Khelsatsqoebis Kamari', 'khelsatsqoebis-kamari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('54bcd3fe-3f36-4f80-8138-b6a966bcc05e', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ხელსაწყოების ჩანთა/ყუთი', 'Khelsatsqoebis Chanta Quti', 'khelsatsqoebis-chanta-quti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('49d3df13-0e25-493d-b6ea-32c4d8239e35', '19065ce3-3680-43d8-9e4e-7887d9212f12', 'ხრახნმჭრელი', 'Khrakhnmchreli', 'khrakhnmchreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('273424f1-f692-4709-acfb-3f3512aa560a', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'ვენტილაციის სისტემები', 'Ventilatsiis Sistemebi', 'ventilatsiis-sistemebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bed45fb8-cf88-4e65-96a3-4fb2eb43e1aa', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'ბოილერი', 'Boileri', 'boileri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('36e960bc-d260-4650-9c72-e27c54bf8130', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'იატაკის გათბობის მილები', 'Iatakis Gatbobis Milebi', 'iatakis-gatbobis-milebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('556f60c1-77f5-4604-bbe3-6944278e4040', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'მზის ენერგიის სისტემა', 'Mzis Energiis Sistema', 'mzis-energiis-sistema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bda45b90-49b3-4f19-a630-5633312ae24b', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'რადიატორი', 'Radiatori', 'radiatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3ee0805d-1441-4aa1-a39a-d86287243b92', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'სათადარიგო ნაწილები', 'and', 'satadarigo-natsilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6eca295e-1661-4b23-b982-2e0f81d03f78', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'საუნის ღუმელი', 'Saunis Ghumeli', 'saunis-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('830259e2-b512-4436-98c9-abc6bb0a116d', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'საფართოებელი ავზი', 'Sapartoebeli Avzi', 'sapartoebeli-avzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b21ef6af-1c6e-47d9-96b7-7f2ccd6587ee', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'ქვაბის გამწოვის მილი', 'Kvabis Gamtsovis Mili', 'kvabis-gamtsovis-mili', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37a942a9-7407-4542-8376-bd765ae35835', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'ცენტრალური გათბობის საშრობი', 'Tsentraluri Gatbobis Sashrobi', 'tsentraluri-gatbobis-sashrobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9f676f33-d9c5-457c-a91f-5697bf3e409d', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'ცენტრალური გათბობის ქვაბი', 'Tsentraluri Gatbobis Kvabi', 'tsentraluri-gatbobis-kvabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1cba2f69-c4a9-48d4-ac12-de8a82e34933', '4bd7cd13-dda9-4146-adf8-8124d61d6a7f', 'ცენტრალური კონდიცირების სისტემა', 'Tsentraluri Konditsirebis Sistema', 'tsentraluri-konditsirebis-sistema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e37fc584-61ae-4092-b6d2-f5eda48a4694', '0c2165f7-f222-430c-9b86-825fefbca579', 'ელექტრო ხელსაწყოების აკუმულატორი', 'Elektro Khelsatsqoebis Akumulatori', 'elektro-khelsatsqoebis-akumulatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('466a801e-7518-4fbd-9f75-6d100651bf79', '0c2165f7-f222-430c-9b86-825fefbca579', 'კარის ზარი', 'Karis Zari', 'karis-zari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('920075ed-10d6-4f43-a87b-4ab289255afa', '0c2165f7-f222-430c-9b86-825fefbca579', 'ელექტროგადამყვანები და  დამაგრძელებლები', 'and', 'elektrogadamqvanebi-da-damagrdzeleblebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a2ed87ea-5496-4a61-959c-2c62809ed3e6', '0c2165f7-f222-430c-9b86-825fefbca579', 'ძაბვის გამმართველები, დამცავები', 'and', 'dzabvis-gammartvelebi-damtsavebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('36937961-5056-43ef-9337-dd85e9d2321d', '0c2165f7-f222-430c-9b86-825fefbca579', 'ჭკვიანი სახლი', 'Chkviani Sakhli', 'chkviani-sakhli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa42b22d-b0fb-425f-a245-a0ed53b3abf8', '0c2165f7-f222-430c-9b86-825fefbca579', 'განათება', 'Ganateba', 'ganateba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ff44a5e0-3836-4b38-89cc-f655879482f0', '0c2165f7-f222-430c-9b86-825fefbca579', 'ელექტროსამონტაჟო პროდუქცია', 'Elektrosamontazho Produktsia', 'elektrosamontazho-produktsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('46196962-72b8-44d8-a8e7-26c37b3bbcf7', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'ავტომატური ამომრთველი', 'Avtomaturi Amomrtveli', 'avtomaturi-amomrtveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f065bc42-436a-4885-9a42-88235b8b954a', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'დამხმარე კონტაქტი', 'and', 'damkhmare-kontakti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('51c3ad7f-15e9-4836-8abe-144ca0cd69a1', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'დენცქვიტა, ჩამრთველი', 'Dentskvita Chamrtveli', 'dentskvita-chamrtveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1cd614ca-38b2-4bcf-bfed-dd7b9e1ba3e9', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'დენცქვიტას ჩარჩო', 'Dentskvitas Charcho', 'dentskvitas-charcho', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('261af2cb-93fd-4a1e-aa60-d31c0a2430f6', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'დიფ რელე', 'Dip Rele', 'dip-rele', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba2e478d-2b0d-41e6-bfaf-635a48ab6897', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'დროის რელე', 'Drois Rele', 'drois-rele', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('18b485f3-5821-487f-9595-e74844874c57', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'ელექტრო გამანაწილებელი ყუთი', 'Elektro Gamanatsilebeli Quti', 'elektro-gamanatsilebeli-quti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c3617e2b-9a48-404f-9931-b7b1e0bdd237', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'ელექტრო სადენი', 'Elektro Sadeni', 'elektro-sadeni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aa4fec02-562d-4550-9e73-0de5b8033c18', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'თერმოსტატი', 'Termostati', 'termostati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('793efb2c-d5ca-4bcd-8407-b03dbba11b78', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'კაბელ არხები', 'Kabel Arkhebi', 'kabel-arkhebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02bc4147-a00d-44f1-ad30-968e4aa97407', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'კოაქსიალური კაბელი', 'Koaksialuri Kabeli', 'koaksialuri-kabeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('71ef2617-e9f3-4328-a313-166875329860', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'კონტაქტორი', 'Kontaktori', 'kontaktori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4819a82a-dd27-4b26-b3ce-8e88e0dd0cdf', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'მექანიკური გამშვები', 'Mekanikuri Gamshvebi', 'mekanikuri-gamshvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('857679e4-20f3-4351-b0fe-9b389f3a9519', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'მექანიკური ტაიმერი', 'Mekanikuri Taimeri', 'mekanikuri-taimeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('452c9721-a47e-457b-b118-5e3e11e73357', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'მრიცხველი', 'Mritskhveli', 'mritskhveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ad53c7aa-2e39-4d98-a00e-d6181406034c', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'სამონტაჟო კოლოფი', 'Samontazho Kolopi', 'samontazho-kolopi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('83f4c326-a5a3-43c6-bd46-8b6cdf936e48', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'ფაზის დამცავი', 'and', 'pazis-damtsavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0781d943-f083-4c97-98b7-7f5d6901b126', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'ფოტოსენსორიანი რელე', 'Potosensoriani Rele', 'potosensoriani-rele', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c6b6f090-1321-4da6-9dbe-71ff7e966a7b', 'ff44a5e0-3836-4b38-89cc-f655879482f0', 'ქსელის (LAN) კაბელი', 'Kselis LAN Kabeli', 'kselis-lan-kabeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('458adc4e-2783-438a-8fe9-3c3df572f1ff', '920075ed-10d6-4f43-a87b-4ab289255afa', 'ელექტროგამანაწილებელი, გადამყვანი', 'and', 'elektrogamanatsilebeli-gadamqvani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5996043f-9806-4713-9bf0-3350938e7bb4', '920075ed-10d6-4f43-a87b-4ab289255afa', 'ელექტროდამაგრძელებელი, ფილტრი', 'and', 'elektrodamagrdzelebeli-piltri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('34bffc87-91cf-4d7c-9a8e-804b6ac0ea7f', '920075ed-10d6-4f43-a87b-4ab289255afa', 'ელექტროჩანგალი, ბუდე', 'Elektrochangali Bude', 'elektrochangali-bude', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c5adfe3-11c1-492b-b299-b0b8f93aa75c', 'a2ed87ea-5496-4a61-959c-2c62809ed3e6', 'სტაბილიზატორი', 'Stabilizatori', 'stabilizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c87d8ec6-6aee-48ed-b365-43e0c11b1237', 'a2ed87ea-5496-4a61-959c-2c62809ed3e6', 'ტრანსფორმატორი', 'Transpormatori', 'transpormatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2fcd15e1-7798-41d7-bdc6-1d5affaa4d48', 'a2ed87ea-5496-4a61-959c-2c62809ed3e6', 'ძაბვის კონვერტორი', 'Dzabvis Konvertori', 'dzabvis-konvertori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7a61670a-079c-462a-b4a6-73ad5ee6e793', 'a2ed87ea-5496-4a61-959c-2c62809ed3e6', 'Ძაბვის მარეგულირებელი', 'Abvis Maregulirebeli', 'dzabvis-maregulirebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dee07966-8f81-419b-a594-c27f90c3e2d5', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ნათურა', 'Natura', 'natura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d047b2d8-6465-4036-98ea-099918ef2096', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ამსტრონგის სანათი', 'Amstrongis Sanati', 'amstrongis-sanati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a9931142-cf78-4d0d-af5e-3f38e86d65ea', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ბრა', 'Bra', 'bra', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1e7f916d-a6a1-4265-b5ed-c397b0120ad2', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'გარე განათება', 'Gare Ganateba', 'gare-ganateba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('62ec5147-6c4e-44cd-89d2-d82e86998bf6', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'დეკორატიული განათება', 'Dekoratiuli Ganateba', 'dekoratiuli-ganateba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d760d129-e3bd-40b5-8fe5-6228ebd2441b', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ლედ ლენტი', 'Led Lenti', 'led-lenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e4276773-a5fc-4ca5-ab10-0ded0109e1ff', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'მაგიდის სანათი', 'Magidis Sanati', 'magidis-sanati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bff86270-3446-4944-8bec-ef21191d6e83', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'მზის პანელები და კომპონენტები', 'and', 'mzis-panelebi-da-komponentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bc5fe902-5d2d-4d77-8739-b7d72eaad01a', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'მოძრაობის სენსორი', 'Modzraobis Sensori', 'modzraobis-sensori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb7f3322-051a-41b3-8613-236fd8b0c145', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ნათურის ვაზნა', 'Naturis Vazna', 'naturis-vazna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b24e27d2-4639-441e-9ca0-d677a546ac7e', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'პროჟექტორი', 'Prozhektori', 'prozhektori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b2c69c5b-8d2b-485f-9f85-c0e4ed68d5d5', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ტორშერი', 'Torsheri', 'torsheri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('908bd672-5ec9-48b4-a01f-f800872f5b26', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ჭაღი', 'Chaghi', 'chaghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04146878-e83e-407e-8a33-a60eba4f2766', 'fa42b22d-b0fb-425f-a245-a0ed53b3abf8', 'ჭერის/კედლის სანათი', 'Cheris Kedlis Sanati', 'cheris-kedlis-sanati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('706a2256-8a0d-4178-905c-0dda3ae451ad', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'აბაზანა', 'Abazana', 'abazana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b260d255-d2d6-4ce0-9faf-b05991faf9e0', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ალუმინის გოფრი', 'Aluminis Gopri', 'aluminis-gopri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1f831593-4c7d-41ce-b51e-435e029a8915', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ბიდე', 'Bide', 'bide', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dca790f3-0db4-4aa4-be56-d97ea9d9cb01', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ბიდეს შემრევი', 'Bides Shemrevi', 'bides-shemrevi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('61b03467-86c4-44fa-a757-850806a0c96f', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'კოლექტორი', 'Kolektori', 'kolektori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e81f48ad-8262-46cf-ae67-db7ea99da664', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ნიჟარა', 'Nizhara', 'nizhara', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4d6bf33d-b834-40be-b606-610e64373aa5', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ონკანი/შემრევი', 'Onkani Shemrevi', 'onkani-shemrevi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb0eeb10-a76b-42f7-9916-f9553216bce3', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'პისუარი', 'Pisuari', 'pisuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dbf09cd3-121f-43ed-96d0-60361420c8e2', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'სანიაღვრე, საკანალიზაციო მილები', 'Saniaghvre Sakanalizatsio Milebi', 'saniaghvre-sakanalizatsio-milebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b26f651-6d3f-400c-83eb-1132991025eb', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'სასმელი წყლის გამწმენდი მოწყობილობა, ფილტრი', 'Beverage', 'sasmeli-tsqlis-gamtsmendi-motsqobiloba-piltri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a6cb5f3c-f473-4026-b8e5-8cc091193d8f', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'საშხაპე და კომპონენტები', 'and', 'sashkhape-da-komponentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('061d702d-105a-4a80-95e8-8cd5f831f755', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'სიფონი', 'Siponi', 'siponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1df297d3-c584-423a-a9fe-ff990ba9a7ee', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ტრაპი, სანიაღვრე არხი', 'Trapi Saniaghvre Arkhi', 'trapi-saniaghvre-arkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3195fd81-9696-4b15-ad1d-9fd45069945e', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'უნიტაზი', 'Unitazi', 'unitazi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0610a66b-f5d5-4fa9-a909-8a5b058be698', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'უნიტაზის გოფრი', 'Unitazis Gopri', 'unitazis-gopri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e529f61b-a996-4d1d-a92f-ca931d45a78e', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'უნიტაზის საფარი', 'Unitazis Sapari', 'unitazis-sapari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e2190d59-51f1-4370-a4db-3e586a298e0b', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'შემაერთებელი მილები და გადამყვანები', 'and', 'shemaertebeli-milebi-da-gadamqvanebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('20b83aa8-a9a5-45ad-9903-5428ab1b5777', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ჩამრეცხი მექანიზმები', 'Chamretskhi Mekanizmebi', 'chamretskhi-mekanizmebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('535edea8-1ca2-424d-9303-778832a22bb4', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'წყალგაყვანილობის მილები და კომპონენტები', 'and', 'tsqalgaqvanilobis-milebi-da-komponentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a2e45c84-abf8-4529-b5e0-639e8f005a19', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'წყლის მილების თბოიზოლაცია', 'Tsqlis Milebis Tboizolatsia', 'tsqlis-milebis-tboizolatsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fdc132de-dc01-451a-8799-1a40697036ae', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'წყლის/გაზის მრიცხველი', 'Tsqlis Gazis Mritskhveli', 'tsqlis-gazis-mritskhveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a4792196-5c2d-4ab4-948d-2fc0159c3ff5', '9d4dfc44-5866-4bf8-91f7-4a97a46560a3', 'ჯაკუზი', 'Jakuzi', 'jakuzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e7dd35ea-6396-4282-99e1-e1b3d5e7d556', '699fd09c-7095-4749-b489-2a55478995e3', 'ავტოფარეხის კარები', 'Avtoparekhis Karebi', 'avtoparekhis-karebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ec5f072-890b-4532-aa46-e112896e590a', '699fd09c-7095-4749-b489-2a55478995e3', 'კარნიზები', 'Karnizebi', 'karnizebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c7f5640-9e59-4676-ae39-fadeef4b38e9', '699fd09c-7095-4749-b489-2a55478995e3', 'მოაჯირები/გისოსები', 'Moajirebi Gisosebi', 'moajirebi-gisosebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04777303-e3e6-46c4-ad8b-87fd30ae0585', '699fd09c-7095-4749-b489-2a55478995e3', 'მწერებისგან დამცავი ბადე', 'and', 'mtserebisgan-damtsavi-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('85550282-bfc7-44d0-9bfb-14bc54ec039f', '699fd09c-7095-4749-b489-2a55478995e3', 'ოთახის კარები', 'Otakhis Karebi', 'otakhis-karebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f8144d4d-8c3a-425b-8ab4-20fbf7412d8b', '699fd09c-7095-4749-b489-2a55478995e3', 'ჟალუზი, ფარდა-ჟალუზი', 'and', 'zhaluzi-parda-zhaluzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aa6b282c-f7e9-45f1-a0e3-f556dfcd798e', '699fd09c-7095-4749-b489-2a55478995e3', 'საავარიო გასასვლელი კარები', 'Saavario Gasasvleli Karebi', 'saavario-gasasvleli-karebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c689f3a-e84f-43ff-8b36-61d5c47e9cd5', '699fd09c-7095-4749-b489-2a55478995e3', 'სარევიზიო სარკმელი', 'Sarevizio Sarkmeli', 'sarevizio-sarkmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0d073258-df69-4fd3-aece-ce2819eeb6ab', '699fd09c-7095-4749-b489-2a55478995e3', 'ფანჯარა', 'Panjara', 'panjara', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e80f3669-4922-407b-9b7a-49661e781f4f', '699fd09c-7095-4749-b489-2a55478995e3', 'ღობე', 'Ghobe', 'ghobe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5948c379-eed9-46f2-a35b-c13ba3d5da3b', '699fd09c-7095-4749-b489-2a55478995e3', 'შემოსასვლელი კარები', 'Shemosasvleli Karebi', 'shemosasvleli-karebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b1883f1b-5f89-434a-96e2-01e4db3918c5', '699fd09c-7095-4749-b489-2a55478995e3', 'ჭიშკარი', 'Chishkari', 'chishkari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('99c333de-311a-417c-b03f-5b54a3f5cdec', 'd1f9ea46-d728-470f-be85-5d8907ae3e87', 'ბოქლომი', 'Boklomi', 'boklomi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('94fa7593-13e3-4f69-bb4a-51c49c0b9f29', 'd1f9ea46-d728-470f-be85-5d8907ae3e87', 'გასაღების შესანახი ყუთი', 'Gasaghebis Shesanakhi Quti', 'gasaghebis-shesanakhi-quti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('171c0ad1-596a-48b4-8c42-baaa306298e0', 'd1f9ea46-d728-470f-be85-5d8907ae3e87', 'კარის საკეტი', 'Karis Saketi', 'karis-saketi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ab6b239-9ad7-4d10-9c01-a20fbcff3c8f', 'd1f9ea46-d728-470f-be85-5d8907ae3e87', 'ურდული', 'Urduli', 'urduli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d6f02d3c-b0eb-4211-98fd-58a9ded72451', 'd1f9ea46-d728-470f-be85-5d8907ae3e87', 'ჭუჭრუტანა', 'Chuchrutana', 'chuchrutana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a8d33a84-a524-4b94-bb00-47fa76cdb654', '2c607179-3bf4-489c-8853-0df999004b2d', 'ბათქაშის ბადე, ლენტები', 'Batkashis Bade Lentebi', 'batkashis-bade-lentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c40869a2-ee31-4ba1-a56e-c5478977afe8', '2c607179-3bf4-489c-8853-0df999004b2d', 'ბეწვახერხის პირები', 'Betsvakherkhis Pirebi', 'betsvakherkhis-pirebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('990354b4-ff9d-47ac-85c3-9a4230798104', '2c607179-3bf4-489c-8853-0df999004b2d', 'ბორმანქანის პირები', 'Bormankanis Pirebi', 'bormankanis-pirebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('384e19a0-406b-4a4e-8971-f9df71a561bb', '2c607179-3bf4-489c-8853-0df999004b2d', 'ბურღის პირები', 'Burghis Pirebi', 'burghis-pirebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8701da55-2f25-407c-903f-75dd9b063f1f', '2c607179-3bf4-489c-8853-0df999004b2d', 'გვარლი (ტროსი)', 'Gvarli Trosi', 'gvarli-trosi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fbbf86ff-ad2b-40a9-976d-aece854338fd', '2c607179-3bf4-489c-8853-0df999004b2d', 'დუბელი, ანკერი', 'Dubeli Ankeri', 'dubeli-ankeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('32940d94-2b42-48f0-be49-96cf3ba0d83b', '2c607179-3bf4-489c-8853-0df999004b2d', 'ელექტროდები', 'Elektrodebi', 'elektrodebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0dcef303-e927-4290-aa0e-3da765af69ba', '2c607179-3bf4-489c-8853-0df999004b2d', 'ზუმფარა (შკურკა)', 'Zumpara Shkurka', 'zumpara-shkurka', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b1d16816-3256-419a-9d21-c2d9458c250d', '2c607179-3bf4-489c-8853-0df999004b2d', 'თერმოიზოლაცია', 'Termoizolatsia', 'termoizolatsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('caf3c185-ff29-4633-92d7-ffcc3b29cae8', '2c607179-3bf4-489c-8853-0df999004b2d', 'თოკი (ბაწარი)', 'Toki Batsari', 'toki-batsari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cca40229-97ea-429f-88f3-f9d880188053', '2c607179-3bf4-489c-8853-0df999004b2d', 'კაბელის სამაგრები', 'Kabelis Samagrebi', 'kabelis-samagrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cbd44f7f-786b-452d-97a8-72a517451aaf', '2c607179-3bf4-489c-8853-0df999004b2d', 'კუთხესახეხის პირები (დისკები)', 'Kutkhesakhekhis Pirebi Diskebi', 'kutkhesakhekhis-pirebi-diskebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f6588db5-465e-43bb-9dba-63059c84ecda', '2c607179-3bf4-489c-8853-0df999004b2d', 'კუთხესახეხის ჯაგრისები', 'Kutkhesakhekhis Jagrisebi', 'kutkhesakhekhis-jagrisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c36653da-e4a4-46cf-a3ac-94e445d6eb06', '2c607179-3bf4-489c-8853-0df999004b2d', 'ლურსმანი', 'Lursmani', 'lursmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a2a47c0d-cbcc-4801-96c8-1bc88e44f7be', '2c607179-3bf4-489c-8853-0df999004b2d', 'პაკლი', 'Pakli', 'pakli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6d04699c-2509-47d7-8245-27b3e8dd3240', '2c607179-3bf4-489c-8853-0df999004b2d', 'საიზოლაციო ლენტი, სკოჩი', 'Saizolatsio Lenti Skochi', 'saizolatsio-lenti-skochi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4bfcb42e-c198-4c1f-8507-023551e65b8b', '2c607179-3bf4-489c-8853-0df999004b2d', 'საკანცელარიო/სამშენებლო დანის პირები', 'and', 'sakantselario-samsheneblo-danis-pirebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d892cf3b-49be-403e-a1e2-a538b7eaf272', '2c607179-3bf4-489c-8853-0df999004b2d', 'სამონტაჟო ქაფი', 'Samontazho Kapi', 'samontazho-kapi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b3274c5f-abdc-4020-b07c-bfb484b223d4', '2c607179-3bf4-489c-8853-0df999004b2d', 'სატაკელაჟო კავი', 'Satakelazho Kavi', 'satakelazho-kavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4d884b85-3613-46aa-b53f-cc24732863a5', '2c607179-3bf4-489c-8853-0df999004b2d', 'სტეპლერის ტყვიები', 'Stepleris Tqviebi', 'stepleris-tqviebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('686fb04e-2585-4759-bd82-4fdcb6177607', '2c607179-3bf4-489c-8853-0df999004b2d', 'შედუღების მავთული', 'Shedughebis Mavtuli', 'shedughebis-mavtuli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('35103299-a8e4-453f-aa41-14c3f030f0ae', '2c607179-3bf4-489c-8853-0df999004b2d', 'ცალუღი (ხამუთი)', 'Tsalughi Khamuti', 'tsalughi-khamuti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04362af9-26af-46a3-8d9c-9f28987c8c02', '2c607179-3bf4-489c-8853-0df999004b2d', 'ცირკულარული ხერხის პირები', 'Tsirkularuli Kherkhis Pirebi', 'tsirkularuli-kherkhis-pirebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b91cd288-e691-47e5-8d2b-ae97c0d80fe9', '2c607179-3bf4-489c-8853-0df999004b2d', 'ჭანჭიკი, ქანჩი', 'Chanchiki Kanchi', 'chanchiki-kanchi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('284b645a-84d6-483c-a3fa-53d228dd2ac2', '2c607179-3bf4-489c-8853-0df999004b2d', 'ხრახნდამჭერის თავაკები', 'and', 'khrakhndamcheris-tavakebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('16861cd5-26b3-425d-a159-67d6c8ba51dd', '2c607179-3bf4-489c-8853-0df999004b2d', 'ხრახნი (შურუფი)', 'Khrakhni Shurupi', 'khrakhni-shurupi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a43fd196-26c5-4cb6-b04c-285635caf2f1', '2c607179-3bf4-489c-8853-0df999004b2d', 'ჯაჭვი', 'Jachvi', 'jachvi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ca00231-df33-4db7-846f-73024e1ec9cd', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'გამხსნელები', 'Gamkhsnelebi', 'gamkhsnelebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('01f8f065-b38f-4527-952e-2e2600733686', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'ემალი', 'Emali', 'emali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d6ad47bd-c023-492f-9ec4-7490662e06bd', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'თხევადი მინა', 'Tkhevadi Mina', 'tkhevadi-mina', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e201d4a0-0c89-4dac-b97e-ca6cadeac88f', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'ლაქები,ხის საჟღენთი საშუალება', 'Lakebi Khis Sazhghenti Sashualeba', 'lakebi-khis-sazhghenti-sashualeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('947661a2-bb39-4a0b-adc5-ba31dad8ca4d', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'მასტიკა', 'Mastika', 'mastika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8ef92d92-24ad-476c-9eb2-52eba9391ddc', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'საღებავები', 'Saghebavebi', 'saghebavebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d2abe31d-254a-4da0-b8b3-a4845983eb9e', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'საღებავის მოსაცილებელი', 'Saghebavis Mosatsilebeli', 'saghebavis-mosatsilebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3b6c1fa8-e9c8-428f-a966-9fea2c7d5bcf', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'საღებარები', 'Saghebarebi', 'saghebarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('497b983c-cdaa-4d5c-9b35-e86225928fec', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'ტაოტი', 'Taoti', 'taoti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d44aad5e-e748-4795-90e0-0731d27af786', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'ფითხი, ბათქაში', 'Pitkhi Batkashi', 'pitkhi-batkashi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fcd661a1-121f-4f7f-b75b-d03b0df32e46', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'წებო', 'Tsebo', 'tsebo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('efb6d391-bd06-486f-98aa-40637ff4c359', '66bb9404-0cba-4bc2-a598-14b4ead27815', 'ჰერმეტიკი, სილიკონი', 'Hermetiki Silikoni', 'hermetiki-silikoni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b0660897-d4c2-4ed5-b5df-e7136923cee8', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'აგური', 'Aguri', 'aguri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4aeebb17-3e33-482b-9105-b915654004bc', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ბაზალტი', 'Bazalti', 'bazalti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dd287e50-b054-4ed6-b55a-7282761f9d7d', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ბითუმის საიზოლაციო მასალები', 'Bitumis Saizolatsio Masalebi', 'bitumis-saizolatsio-masalebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('95ba08bd-fd0f-42bf-b8dd-47469b3d0eed', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ბორდიურები, ბეტონის ბოძები/ფილები, სინკარი', 'Bordiurebi Betonis Bodzebi Pilebi Sinkari', 'bordiurebi-betonis-bodzebi-pilebi-sinkari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cb33c86e-ba2d-4753-a00e-320c18fd0dda', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'გაჯი', 'Gaji', 'gaji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c151bfc7-433f-47f5-ab8a-1df7ad27dfaf', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'გრუნტი', 'Grunti', 'grunti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2ad22525-f765-4b60-a829-39e6e5f4e242', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'თაბაშირი', 'Tabashiri', 'tabashiri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4d81729c-cef0-4cba-9285-6b3ab25ce87c', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'თაბაშირმუყაო, სამონტაჟო პროფილები', 'Tabashirmuqao Samontazho Propilebi', 'tabashirmuqao-samontazho-propilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2d1d52e7-ba7c-426a-a3a4-891f630c515f', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'თბო და ჰიდრო იზოლაცია', 'and', 'tbo-da-hidro-izolatsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('95af4dec-9c8c-4945-b01e-2c9446bd6675', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'კრამიტი', 'Kramiti', 'kramiti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a8a3d4dd-08fd-4abe-a230-fdb253fbe644', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'მავთულბადე', 'Mavtulbade', 'mavtulbade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0b48d24e-f91a-4b91-85d2-1ebeb873a41b', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'მინა', 'Mina', 'mina', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('73a34800-61c2-4d8d-8fa1-e1087966304b', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'მინაბამბა/მინერალური ბამბა', 'Minabamba Mineraluri Bamba', 'minabamba-mineraluri-bamba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba30336c-936b-47a2-841d-bd5aff06e72f', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'პემზა', 'Pemza', 'pemza', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b8e7f873-d8ac-4a9a-bf13-657f2b916c45', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'პერლიტი', 'Perliti', 'perliti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('40238865-b3e8-42c8-b0b1-976af2c3b959', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'სამშენებლო ბლოკი', 'Samsheneblo Bloki', 'samsheneblo-bloki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1e137d09-c9fe-4697-941a-47b1d79204b9', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'სანიაღვრე არხები, ჭები', 'Saniaghvre Arkhebi Chebi', 'saniaghvre-arkhebi-chebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8a897d11-d609-4642-97a9-35b30db05fc1', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'საფითხნი(შპაკლი)', 'Sapitkhni Shpakli', 'sapitkhni-shpakli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fdb2f348-e7a5-4ce0-847b-6cc7c1682ad2', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'სახურავი', 'Sakhuravi', 'sakhuravi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4f000992-4315-4455-b545-2be5726f140c', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ფილის შემავსებელი', 'Pilis Shemavsebeli', 'pilis-shemavsebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d64f461c-d7d4-4c43-9424-05e569321859', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ფუგა', 'Puga', 'puga', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('be7af132-fe60-45cc-ba41-e0fd41094b32', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ქვაბამბა', 'Kvabamba', 'kvabamba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1159c41b-d620-4741-bf42-f1145503026d', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ქვიშა', 'Kvisha', 'kvisha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6e0ccb60-e2a7-4a87-ac23-010105d88d8b', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ცემენტი', 'Tsementi', 'tsementi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2c3e57a8-6aaa-4e5f-81cf-d0a8c02a64cb', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'წებოცემენტი', 'Tsebotsementi', 'tsebotsementi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2f385d6e-0399-4d91-8c1f-a22b72e1dd01', 'c0122cf3-24f4-4b1d-8859-8178d5203d14', 'ხრეში, ბალასტი', 'Khreshi Balasti', 'khreshi-balasti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3d990f21-af5f-4fc7-bb69-2ac161231148', '10746dda-83a7-4b02-8720-0d323fd85e96', 'არმატურის საღუნი, საჭრელი დანადგარი', 'and', 'armaturis-saghuni-sachreli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0e4b9e02-4773-41d4-837a-b32338f836f8', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ბეტონის ბადია', 'Betonis Badia', 'betonis-badia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('494b347a-c835-4ba2-adbf-99aa6a767865', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ბეტონის მოსახვეწი დანადგარი', 'and', 'betonis-mosakhvetsi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f9daa0a4-0a0f-4947-b877-bc9305db9aab', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ბეტონის პომპა', 'Betonis Pompa', 'betonis-pompa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('34e73925-184c-4635-aad7-3c18b368d645', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ბიო ტუალეტი', 'Bio Tualeti', 'bio-tualeti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0996aeae-8021-42ca-aa3d-bb28c7e8f044', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ვიბრო სატკეპნი დანადგარი', 'and', 'vibro-satkepni-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6dfc238-d21f-4d0f-8340-16258d064b96', '10746dda-83a7-4b02-8720-0d323fd85e96', 'პადონის, პალეტის ურიკა', 'Padonis Paletis Urika', 'padonis-paletis-urika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6a722f0b-a6e8-4516-a996-54afe535787c', '10746dda-83a7-4b02-8720-0d323fd85e96', 'სამშენებლო დგარები, კოჭები', 'Samsheneblo Dgarebi Kochebi', 'samsheneblo-dgarebi-kochebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1af8a803-f28c-45da-a1ea-7346433a70f4', '10746dda-83a7-4b02-8720-0d323fd85e96', 'სამშენებლო კალათა', 'Samsheneblo Kalata', 'samsheneblo-kalata', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5742fc7b-5b26-4486-84e9-c1b595f90627', '10746dda-83a7-4b02-8720-0d323fd85e96', 'სამშენებლო მოდულები, ყალიბები', 'Samsheneblo Modulebi Qalibebi', 'samsheneblo-modulebi-qalibebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bbcec4ff-bc20-4347-acb7-5541ee6f04fa', '10746dda-83a7-4b02-8720-0d323fd85e96', 'სამშენებლო საშრობი დანადგარი', 'and', 'samsheneblo-sashrobi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b5e96f0-db3c-4f25-a031-6d6840e5dc3a', '10746dda-83a7-4b02-8720-0d323fd85e96', 'სამშენებლო ურიკა', 'Samsheneblo Urika', 'samsheneblo-urika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b075d4a5-015b-4981-b887-1d96949d5cb9', '10746dda-83a7-4b02-8720-0d323fd85e96', 'სამშენებლო ურნა, სექციური ნაგავსაცლელი', 'Samsheneblo Urna Sektsiuri Nagavsatsleli', 'samsheneblo-urna-sektsiuri-nagavsatsleli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bfdaf34a-4e9d-4f87-8157-cd2f8839b233', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ტვირთის ამწე/წერო', 'Tvirtis Amtse Tsero', 'tvirtis-amtse-tsero', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('979bcafb-745c-40c0-8ad8-851687cb7c17', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ყალიბის დამჭერი (პეპელა)', 'and', 'qalibis-damcheri-pepela', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1d05f1f9-8336-4480-84a4-e998a20764f6', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ცემენტის/ბეტონის მომრევი', 'Tsementis Betonis Momrevi', 'tsementis-betonis-momrevi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dc1455f6-0c17-4758-8a01-919f3c4e199c', '10746dda-83a7-4b02-8720-0d323fd85e96', 'ხარაჩო', 'Kharacho', 'kharacho', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bebf7a33-2c42-446c-9b1e-2d872629c523', '36937961-5056-43ef-9337-dd85e9d2321d', 'სახლის ჭკვიანი უსაფრთხოება', 'Sakhlis Chkviani Usaprtkhoeba', 'sakhlis-chkviani-usaprtkhoeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dffe5890-6410-45e3-ba91-d59382678580', '36937961-5056-43ef-9337-dd85e9d2321d', 'ჭკვიანი ასისტენტი', 'Chkviani Asistenti', 'chkviani-asistenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80430d25-ec75-4a00-aa50-08ec9f07a468', '36937961-5056-43ef-9337-dd85e9d2321d', 'ჭკვიანი განათება', 'Chkviani Ganateba', 'chkviani-ganateba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5ed0dfcb-bc3c-4df2-bf26-47b31570879e', '36937961-5056-43ef-9337-dd85e9d2321d', 'ჭკვიანი როზეტები, ჩამრთველები', 'Chkviani Rozetebi Chamrtvelebi', 'chkviani-rozetebi-chamrtvelebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e07d2434-37dd-400d-9724-c0fbef546502', '36937961-5056-43ef-9337-dd85e9d2321d', 'ჭკვიანი საკეტი', 'Chkviani Saketi', 'chkviani-saketi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f41dad1f-8950-4354-b0f1-dc44b22dc979', '36937961-5056-43ef-9337-dd85e9d2321d', 'ჭკვიანი სახლის მართვის ცენტრი', 'Chkviani Sakhlis Martvis Tsentri', 'chkviani-sakhlis-martvis-tsentri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('39266be3-069f-4ef1-b23d-7d8f1df5e841', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'ბაზალტი', 'Bazalti', 'bazalti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6c54afd4-25a1-48ce-9dec-6ccbaad9593a', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'ბუნებრივი მარმარილო', 'Bunebrivi Marmarilo', 'bunebrivi-marmarilo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('da51285d-d312-451a-aa8a-20502972d1f9', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'გრანიტი', 'Graniti', 'graniti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('03d6c44e-889a-45a5-88e4-76595081e28d', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'დეკორატიული ფილები', 'Dekoratiuli Pilebi', 'dekoratiuli-pilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('89f83c33-0053-47de-a85b-c9fb2c34f6a3', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'იატაკის ფილები, მეტლახი', 'Iatakis Pilebi Metlakhi', 'iatakis-pilebi-metlakhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('826b4aab-3679-4519-95af-b06935cc06fe', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'კერამიკული ფილა, კაფელი', 'Keramikuli Pila Kapeli', 'keramikuli-pila-kapeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba38bf74-fc13-4925-8bde-103c5953c083', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'კვარცი', 'Kvartsi', 'kvartsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6a1bbdf6-ac61-4020-8fbf-c03cb3632931', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'ლამინატი', 'Laminati', 'laminati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7a6d76cc-edb0-4d08-8437-e393ffde01f4', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'ლამინატის ქვესაგები/პენოპლექსი', 'Laminatis Kvesagebi Penopleksi', 'laminatis-kvesagebi-penopleksi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bcdf8bdb-0f1e-4b72-bf70-ca9a18b4e75b', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'ლინოლიუმი', 'Linoliumi', 'linoliumi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2c01e3d1-2521-48cc-9606-19d6ff8d423e', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'მოსაპირკეთებელი ქვა', 'Mosapirketebeli Kva', 'mosapirketebeli-kva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('88b3794d-f4c7-4749-8a34-556e161c648c', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'პარკეტი', 'Parketi', 'parketi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('52ad2f1f-1728-48d1-a851-b6511f78cdad', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'პლინტუსი', 'Plintusi', 'plintusi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('71f96a09-4a84-480a-acd1-1ce0b5317685', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'ტრავერტინი', 'Travertini', 'travertini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('73e29394-1efb-4a99-aa53-22a72948694f', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'შეკიდული ჭერი', 'Shekiduli Cheri', 'shekiduli-cheri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('09c016c3-e0a9-4511-9c90-a80486d7f42e', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'შპალერი', 'Shpaleri', 'shpaleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e8ebc729-024a-4cfd-9286-0607a5065da6', 'a8bfec26-ae28-4666-b7dc-4952a0c81b9c', 'ხელოვნური მარმარილო', 'Khelovnuri Marmarilo', 'khelovnuri-marmarilo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b822655b-a80d-4b64-be27-a26f95c3b48a', '13b69dda-9cfc-474e-b385-221e0c1c9541', 'ჩასაშენებელი ვაკუუმის აპარატი', 'Chasashenebeli Vakuumis Aparati', 'chasashenebeli-vakuumis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('987ec613-6869-48d0-a014-4d1483fb905a', '13b69dda-9cfc-474e-b385-221e0c1c9541', 'ჩასაშენებელი მიკროტალღური ღუმელი', 'Chasashenebeli Mikrotalghuri Ghumeli', 'chasashenebeli-mikrotalghuri-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8cacb0d8-63f1-4b73-a516-c9672698e65a', '13b69dda-9cfc-474e-b385-221e0c1c9541', 'ჩასაშენებელი ქურა', 'Chasashenebeli Kura', 'chasashenebeli-kura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02716835-2a85-4f76-8704-132e635959f2', '13b69dda-9cfc-474e-b385-221e0c1c9541', 'ჩასაშენებელი ღუმელი', 'Chasashenebeli Ghumeli', 'chasashenebeli-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c45d86e6-4bce-452e-b8a5-b50c467284e4', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'მაცივარი', 'Matsivari', 'matsivari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f6fb7c60-3fc1-4bb7-818b-07ff0b963514', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'სარეცხი მანქანა', 'Saretskhi Mankana', 'saretskhi-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('39534537-3fe3-4764-9bc7-bbec3187978d', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'სარეცხის საშრობი მანქანა', 'Saretskhis Sashrobi Mankana', 'saretskhis-sashrobi-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('836346c2-f128-438d-806e-7c7f65d0dc3a', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'ქურა', 'Kura', 'kura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('54a29449-7fdd-489e-a109-c569bdfb0bd8', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'წყლის გამაცხელებელი', 'Tsqlis Gamatskhelebeli', 'tsqlis-gamatskhelebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f36f8087-d5de-491c-a91d-5207c91244ee', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'ჭურჭლის სარეცხი მანქანა', 'Churchlis Saretskhi Mankana', 'churchlis-saretskhi-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('67682e5f-3113-4650-be67-7c8dae6c2bb5', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'ჰაერგამწოვი', 'Haergamtsovi', 'haergamtsovi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bde49728-a012-4a59-baad-96c9a9401182', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'ავტომობილის მაცივარი', 'Avtomobilis Matsivari', 'avtomobilis-matsivari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4079e627-f580-42c8-82c0-25abe4a888a7', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'საყინულე მაცივარი', 'Saqinule Matsivari', 'saqinule-matsivari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5656c5f7-4304-4de9-891a-1154a63031e4', '260b079c-12a8-48c0-9530-3b32b25b8c00', 'ღვინის მაცივარი', 'Ghvinis Matsivari', 'ghvinis-matsivari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4d71788d-6c8b-4be3-8591-9fa781237ed1', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'აეროგრილი', 'Aerogrili', 'aerogrili', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7b0348db-9ff8-4f96-babe-d7183737789a', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ბლენდერი', 'Blenderi', 'blenderi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b449b9ef-7b9b-4bdf-b524-3593c9844ab1', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ელექტროღუმელი', 'Elektroghumeli', 'elektroghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6746b63-8ab1-46d4-8c4a-bbdce0fbe5d3', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'მდღვებავი (მიქსერი)', 'Mdghvebavi Mikseri', 'mdghvebavi-mikseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eb8be2fb-5dc7-4c23-8731-de26358dd0a8', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'მიკროტალღური ღუმელი', 'Mikrotalghuri Ghumeli', 'mikrotalghuri-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b72fa0f7-01fc-4b0a-bf74-146b10cccd1c', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'მულტიფუნქციური ქვაბი', 'Multipunktsiuri Kvabi', 'multipunktsiuri-kvabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ab806c06-6c66-4810-97d1-601a1f686492', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'პურის საცხობი', 'Puris Satskhobi', 'puris-satskhobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3f51ef49-5eef-4f01-8a60-9c007d3e3b50', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'პურის სახუხი', 'Puris Sakhukhi', 'puris-sakhukhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7242a621-5aa7-48e6-bebb-b8e8e299f582', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'სამზარეულო კომბაინი', 'Samzareulo Kombaini', 'samzareulo-kombaini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('efe3569d-17b3-400d-870d-7a0cd23f625d', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'სენდვიჩერი/გრილი', 'Sendvicheri Grili', 'sendvicheri-grili', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b934df73-a692-4a5b-a1b6-609c394d01e8', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ფრის აპარატი', 'Pris Aparati', 'pris-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('339dcd7c-9c06-4bbb-8937-7ab1b304fe33', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ყავის აპარატი', 'Qavis Aparati', 'qavis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('76282b26-1082-45ff-a5a5-3c0de0d84204', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ჩაიდანი', 'and', 'chaidani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('92e0cf59-6b7e-413d-8e2d-87a69deb4f31', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'წვენსაწური', 'Tsvensatsuri', 'tsvensatsuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d45fc9dc-7e74-489d-93ab-768ac9bd6027', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ხორცსაკეპი', 'Khortssakepi', 'khortssakepi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('27eb89b0-17fd-40b7-94e9-3c6fd81c65fb', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'დანის სალესი', 'and', 'danis-salesi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('065e70ac-5553-426e-a01f-de7a24a2dbc7', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ელექტრომაყალი', 'Elektromaqali', 'elektromaqali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('98eeedb4-4fac-4bac-8597-819b84d00033', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ვაფლის საცხობი', 'Vaplis Satskhobi', 'vaplis-satskhobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('120a97ca-5636-4612-8773-af8323a47c88', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'თურქული ყავის მადუღარა', 'Turkuli Qavis Madughara', 'turkuli-qavis-madughara', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dcd6c7dd-30ed-46c0-a15e-28388697dae9', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'იოგურტის აპარატი', 'Iogurtis Aparati', 'iogurtis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ad5b99d9-f3e0-4275-a525-f85a93e893c4', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'კაკლის ნამცხვრის საცხობი', 'Kaklis Namtskhvris Satskhobi', 'kaklis-namtskhvris-satskhobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e018a98f-a136-4c13-ad56-8d1df6fa29bb', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'კვერცხის მოსახარში', 'Kvertskhis Mosakharshi', 'kvertskhis-mosakharshi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('50ed4bf3-8071-4d0f-8a49-893bf54a0e81', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'კრეპის(ბლინის) საცხობი', 'Krepis Blinis Satskhobi', 'krepis-blinis-satskhobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6aa421c-3870-4635-8654-63b8b033cd7e', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'კულინარიული თერმომეტრი', 'Kulinariuli Termometri', 'kulinariuli-termometri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('acb5f33c-02f5-4b96-8b17-965790d0cb3b', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ნაყინის/ყინულის აპარატი', 'Naqinis Qinulis Aparati', 'naqinis-qinulis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cc8919c3-90e2-4b90-acc1-20dfe3d6e668', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'პოპკორნის აპარატი', 'Popkornis Aparati', 'popkornis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d8d94aca-31ae-4142-84a9-c44c89d1b044', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'რძის ასაქაფებელი', 'Rdzis Asakapebeli', 'rdzis-asakapebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('beee3dc3-2dc8-49df-97ec-ed6d90386385', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'საკვების ვაკუუმის აპარატი', 'Sakvebis Vakuumis Aparati', 'sakvebis-vakuumis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1422593d-a603-4f66-af5c-070ed05652b7', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'სამზარეულო სასწორი', 'Samzareulo Sastsori', 'samzareulo-sastsori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('90b9d363-2c26-4d0c-9dcb-d6cf08009d79', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'სლაისლერი', 'Slaisleri', 'slaisleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fbb65bac-8007-4c03-9cc7-0b459fc52b29', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ყავის საფქვავი', 'Qavis Sapkvavi', 'qavis-sapkvavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2d1a4aec-16ba-4f3c-a73c-6d138658c770', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ჩაის აპარატი', 'Chais Aparati', 'chais-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f4c919f8-6e1e-4d97-84c3-83647124d497', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ჩირის აპარატი', 'Chiris Aparati', 'chiris-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ad9d6bf9-6e54-4d8d-88d6-b1f6999ff64a', '3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ჩოპერი', 'Choperi', 'choperi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eccc9949-6e22-41e8-ab6f-a2ab9f70350b', '114fe6c1-1a71-4235-8563-8e6e062891a0', 'კონდიციონერი', 'Konditsioneri', 'konditsioneri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7da688f8-6dbc-4ce6-afff-69fce159150f', '114fe6c1-1a71-4235-8563-8e6e062891a0', 'გამათბობელი', 'Gamatbobeli', 'gamatbobeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('383d9851-8b74-40dc-9051-eacac4024214', '114fe6c1-1a71-4235-8563-8e6e062891a0', 'ვენტილატორი', 'Ventilatori', 'ventilatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e285562e-3f59-4907-a8a5-e27e4904a5a8', '114fe6c1-1a71-4235-8563-8e6e062891a0', 'ჰაერის გაწმენდა/დატენიანება', 'and', 'haeris-gatsmenda-datenianeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1272f173-c46e-43a0-be9b-5e6af8b9e222', 'b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'მტვერსასრუტი', 'Mtversasruti', 'mtversasruti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('58a8ac56-618e-4c1a-bbfd-7872959fde2f', 'b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'საკერავი მანქანა', 'Sakeravi Mankana', 'sakeravi-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('871e700e-1e6e-4861-ba0c-235b818c48de', 'b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'იატაკის სასწორი', 'Iatakis Sastsori', 'iatakis-sastsori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('05fc4ce2-0b4e-441a-9a90-a4185f85f4dd', 'b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'უთო', 'Uto', 'uto', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea3ed452-6863-4427-989a-4c7095eb22eb', 'b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'ელექტრო ცოცხი', 'Elektro Tsotskhi', 'elektro-tsotskhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1dc407a1-5866-49c9-8ea2-d77f4dc528f1', 'b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'მინის საწმენდი რობოტი', 'Minis Satsmendi Roboti', 'minis-satsmendi-roboti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4b7f15a6-d74f-4487-a9d8-4fcbc322a720', 'b1391f76-8caf-46a6-9cf4-1de5917f03dd', 'ტანსაცმლის ტრიმერი', 'Tansatsmlis Trimeri', 'tansatsmlis-trimeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('926d800a-d9fd-4e2c-9916-933522eb684b', 'cd511e52-bf17-4987-9baf-14ab1b9587bf', 'ეპილატორი', 'Epilatori', 'epilatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('35ca229c-1a15-4be6-808a-d639ae048a1e', 'cd511e52-bf17-4987-9baf-14ab1b9587bf', 'თმის საკრეჭი', 'Tmis Sakrechi', 'tmis-sakrechi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7a833bd4-d1ea-4d7a-8d21-55b4e85564a2', 'cd511e52-bf17-4987-9baf-14ab1b9587bf', 'თმის უთო', 'Tmis Uto', 'tmis-uto', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a1d27b97-3860-4672-9852-a3386c360a6a', 'cd511e52-bf17-4987-9baf-14ab1b9587bf', 'თმის ფენი', 'Tmis Peni', 'tmis-peni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('86093832-45da-49a1-aa99-27b37aba75b7', 'cd511e52-bf17-4987-9baf-14ab1b9587bf', 'მასაჟორი', 'Masazhori', 'masazhori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('817fecaf-5fc1-4151-8b5d-907f742a4017', 'cd511e52-bf17-4987-9baf-14ab1b9587bf', 'წვერსაპარსი', 'Tsversaparsi', 'tsversaparsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c5f298e-71ef-4d5a-acda-67de296e7a8f', '04470a8b-b900-4548-8604-b604301d4ff8', 'ფილტრი', 'Piltri', 'piltri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8f7899eb-d867-4158-9d91-158440aea98d', '04470a8b-b900-4548-8604-b604301d4ff8', 'ფილტრიანი სურა(დოქი)', 'Piltriani Sura Doki', 'piltriani-sura-doki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac65be3e-b492-42fa-b74e-9955fc04b533', '04470a8b-b900-4548-8604-b604301d4ff8', 'წყლის გაფილტვრის სისტემა', 'Tsqlis Gapiltvris Sistema', 'tsqlis-gapiltvris-sistema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b52c0dff-33ea-4c91-9717-19c5aa977395', '04470a8b-b900-4548-8604-b604301d4ff8', 'წყლის დისპენსერი', 'Tsqlis Dispenseri', 'tsqlis-dispenseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0471d96d-e9d2-4ace-952d-8fd15db50548', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'ავეჯის გადასაფარებელი', 'Furniture', 'avejis-gadasaparebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('25dd009e-0351-4612-bb43-4cc134666055', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'ბალიში', 'Balishi', 'balishi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0a332151-fd83-4997-8e70-ebc74606b6e9', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'ბალიშისპირი', 'Balishispiri', 'balishispiri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('50867ad7-48f0-49af-820e-9e252d603cc0', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'ლეიბი', 'Leibi', 'leibi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2b093640-e3b7-4db6-92d6-c2c4aaa11b2f', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'მაგიდის გადასაფარებელი', 'and', 'magidis-gadasaparebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ca338788-062e-40c5-8dd8-c7f61b7eddc8', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'მატრასი', 'Matrasi', 'matrasi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b02b03cf-d372-48df-9a1d-aa47eb65954d', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'პლედი', 'Pledi', 'pledi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('11a6ed01-79dd-486b-b922-8bd820a1c4f9', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'საბანი', 'Sabani', 'sabani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c29064bf-b8b7-470d-be64-98e4b14aca70', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'საძილე ნიღაბი', 'Sadzile Nighabi', 'sadzile-nighabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c320a84c-932e-4d4a-8e43-126ed19abb1d', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'საწოლის გადასაფარებელი', 'and', 'satsolis-gadasaparebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2460d9d7-94f1-484c-ad48-30ca189d1604', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'საწოლის თეთრეული', 'Satsolis Tetreuli', 'satsolis-tetreuli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('94123f35-27ca-4bba-8c02-0832df97dc90', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'ფარდა', 'and', 'parda', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4a025c19-c49c-4f19-a72e-08141109d226', '71b5d2ed-fab2-4787-acef-6389a5afa2b7', 'აბაზანის სამოსი და აქსესუარი', 'and', 'abazanis-samosi-da-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('07089d2b-e0b0-41d0-901a-909c99222e80', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'გრილი, მაყალი', 'Grili Maqali', 'grili-maqali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e537ffff-0395-4586-bc03-3c886fc9de1b', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'ეზოს ავეჯის ნაკრები', 'Furniture', 'ezos-avejis-nakrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('43816462-48a8-49cb-bfcc-c4d950c971d2', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'ეზოს დეკორაცია', 'Ezos Dekoratsia', 'ezos-dekoratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4a1e1ab8-10fd-4f6b-ad20-18720484e041', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'ეზოს მაგიდა', 'and', 'ezos-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0f0aaada-e7d8-4277-9a38-ec7425051c83', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'ეზოს სკამი', 'Ezos Skami', 'ezos-skami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('708e8ba8-e864-48a4-a30b-80cd04d048cf', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'საქანელა', 'Sakanela', 'sakanela', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('13450a7b-c85d-47ba-b793-6fb185dae05a', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'ქოლგა, ტენტი, ფანჩატური', 'Kolga Tenti Panchaturi', 'kolga-tenti-panchaturi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b1978bf-e050-465f-a7a8-a6ba85c7303b', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'შამფურები და მაყალის აქსესუარები', 'and', 'shampurebi-da-maqalis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7e308a99-5a8f-4d3c-bcff-2012bcdfc8c8', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'შეზლონგი', 'Shezlongi', 'shezlongi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d56544e5-8fcd-47a0-a8f6-b686685a4d29', '79360bcb-906b-4d87-89a9-4cfe0eacafb6', 'ჰამაკი', 'Hamaki', 'hamaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('79d6bb47-04c3-4080-8c43-9f636dee633f', '531986db-322b-4dd5-b4cd-0fbd4513d937', 'პესტიციდები და სასუქები', 'and', 'pestitsidebi-da-sasukebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('415d5dd0-d30c-4a0b-a961-ccbc1f026fef', '531986db-322b-4dd5-b4cd-0fbd4513d937', 'განათება მცენარეებისთვის', 'Ganateba Mtsenareebistvis', 'ganateba-mtsenareebistvis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6f1237f7-c8c5-4d2c-9c59-434a3e28fa56', '531986db-322b-4dd5-b4cd-0fbd4513d937', 'გროუბოქსი', 'Grouboksi', 'grouboksi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6a28a891-b5a8-4885-8c2b-a66924bb4d0f', '531986db-322b-4dd5-b4cd-0fbd4513d937', 'დეკორატიული ბალახი და სუკულიენტები', 'and', 'dekoratiuli-balakhi-da-sukulientebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('093bbb1d-80e3-48e7-91f1-2139d4866a58', '531986db-322b-4dd5-b4cd-0fbd4513d937', 'მცენარის ქოთნები', 'Mtsenaris Kotnebi', 'mtsenaris-kotnebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f1a9a64c-07d0-46e5-b01f-dccaebb33871', '531986db-322b-4dd5-b4cd-0fbd4513d937', 'მცენარეები', 'Mtsenareebi', 'mtsenareebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('899709dd-779f-4aaa-bf68-9fa41d067aa0', 'f1a9a64c-07d0-46e5-b01f-dccaebb33871', 'ნერგები', 'Nergebi', 'nergebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a6a82717-ea4e-4550-9e65-9b3b8a8ed7ad', 'f1a9a64c-07d0-46e5-b01f-dccaebb33871', 'ზრდასრული მცენარეები', 'and', 'zrdasruli-mtsenareebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f45ce171-7ac5-4830-8b04-8ca9d026fe2c', 'f1a9a64c-07d0-46e5-b01f-dccaebb33871', 'მცენარეების თესლები', 'Mtsenareebis Teslebi', 'mtsenareebis-teslebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('23debdff-5417-4775-95cc-c24c06f294ba', '8e733140-037f-47f4-8cac-7e090e959c59', 'ალკოჰოლური სასმელი', 'Beverage', 'alkoholuri-sasmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d96fa163-bd2a-4f84-b372-7cffbf48b70b', '8e733140-037f-47f4-8cac-7e090e959c59', 'კვების პროდუქტი', 'Kvebis Produkti', 'kvebis-produkti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('583d28c1-f2d5-4019-9999-f65f83fc6902', '8e733140-037f-47f4-8cac-7e090e959c59', 'უალკოჰოლო სასმელი', 'Beverage', 'ualkoholo-sasmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c80527f2-8ffb-4833-be80-292f0a9549ce', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ბარი', 'Bari', 'bari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3b06c361-e702-48ee-a6a7-4380c93fbc63', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ბაღის ბურღი', 'Baghis Burghi', 'baghis-burghi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('65cbc34a-68e4-493c-b5ac-27745e35a942', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ბაღის დანა', 'and', 'baghis-dana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('baca9314-bbf9-4bb1-b774-bf9f27fc97dc', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ბაღის მაკრატელი', 'Baghis Makrateli', 'baghis-makrateli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('169c37a9-b851-45b2-a83a-c2766b1fa63b', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ბაღის ცოცხი', 'Baghis Tsotskhi', 'baghis-tsotskhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('070665d8-2126-406a-abf0-99f4b87997ed', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ბუჩქის საკრეჭი/ელექტრო სეკატორი', 'Buchkis Sakrechi Elektro Sekatori', 'buchkis-sakrechi-elektro-sekatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fd1d8994-c832-450e-9836-60157ab32fa0', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'გრდემლი', 'Grdemli', 'grdemli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('34bde72d-9378-4422-acc7-a2d6376733cb', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ვარცლი', 'Vartsli', 'vartsli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6bf8c364-eadc-4fee-9067-f0e5419c7168', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'თოხი', 'Tokhi', 'tokhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('198ff475-14b6-43a2-b3f6-8bfa62c8e4ca', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'კულტივატორი/ბაღის ჩანგალი', 'Kultivatori Baghis Changali', 'kultivatori-baghis-changali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a7e09511-e254-4693-982c-c8ecb55c1999', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'მარიალიანობის საზომი', 'Marialianobis Sazomi', 'marialianobis-sazomi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37611c5a-146e-4e27-ba5e-ba516857dacc', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'მექანიკური სეკატორი', 'Mekanikuri Sekatori', 'mekanikuri-sekatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('81c4a94e-281a-459d-9a13-e66f2ed5ead4', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'მექანიკური ხერხი', 'Mekanikuri Kherkhi', 'mekanikuri-kherkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bb65d3cf-9c1d-4202-b89c-e0b63f832318', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'მჟავიანობის საზომი', 'Mzhavianobis Sazomi', 'mzhavianobis-sazomi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('449b52d5-b50e-4130-a0d6-c606fa1938bd', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'მცენარის/ვაზის შესაკრავი', 'Mtsenaris Vazis Shesakravi', 'mtsenaris-vazis-shesakravi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('88198c49-c6f0-4e9d-b43e-e99e63a210ea', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ნაგვის ამკრეფი(მაშები)', 'Nagvis Amkrepi Mashebi', 'nagvis-amkrepi-mashebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('86a4d2a1-a0bc-46d6-9fa6-ebee731a9ebf', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ნიჩაბი', 'Nichabi', 'nichabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ed4296d8-6032-4e32-aad6-9fd5e7d5f443', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'პენეტრომეტრი', 'Penetrometri', 'penetrometri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a528b2d6-ed2d-49fd-a6ec-ca26af09fb27', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'რეფრაქტომეტრი/შაქრიანობის საზომი', 'Repraktometri Shakrianobis Sazomi', 'repraktometri-shakrianobis-sazomi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ca1acdab-5c1f-4880-8836-b29a5b044e9b', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'სათესი ნიჩაბი', 'Satesi Nichabi', 'satesi-nichabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('36922455-3b46-421c-aec8-3a68f70a6abd', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'სათლი', 'Satli', 'satli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('63c16eff-cba3-408c-94b5-a7f7e0929ec0', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'სამეურნეო თერმომეტრი', 'Sameurneo Termometri', 'sameurneo-termometri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4e1df9e7-fee4-413d-973b-a43e524de10b', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'სამყნობი მაკრატელი', 'Samqnobi Makrateli', 'samqnobi-makrateli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('74312197-7a9d-4c12-b072-69fd973896cc', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'სარეველას მოსაშორებელი', 'Sarevelas Mosashorebeli', 'sarevelas-mosashorebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1b1b0470-174b-467f-bdd0-b07f34c8a113', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'სითხის ჩამოსასხმელი', 'Sitkhis Chamosaskhmeli', 'sitkhis-chamosaskhmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('deb63021-56c1-4ddc-bfbd-c16a435f7589', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'სპირტიანობის საზომი', 'Spirtianobis Sazomi', 'spirtianobis-sazomi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eadafc30-ec6b-4cc1-85e1-a48a4153f286', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ტენიანობის საზომი/ჰიდრომეტრი', 'Tenianobis Sazomi Hidrometri', 'tenianobis-sazomi-hidrometri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6f5f5832-ed71-49be-82dd-e73b8a1054af', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ტოტმჭრელი', 'Totmchreli', 'totmchreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('96a0e15e-48cc-4351-9647-d9c5ae8b9dbb', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ფიწალი', 'Pitsali', 'pitsali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f8f92f2e-ffb1-4762-add1-7e7b0d20406a', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ფოცხი', 'Potskhi', 'potskhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d5334ddf-955c-4249-b3b0-85b0e20618ae', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ღვინის ტუმბო', 'Ghvinis Tumbo', 'ghvinis-tumbo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('48e875b0-1008-4b79-93fc-11593c7cff0f', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ყუთები/ტომრები', 'Qutebi Tomrebi', 'qutebi-tomrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('06859d66-3b12-47fc-a8b9-c870c69c1117', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'ცული', 'Tsuli', 'tsuli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02504593-5081-45cb-b120-28e44bf08122', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'წალდი', 'Tsaldi', 'tsaldi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1e2051ac-0899-45a7-b2dc-1e01da6a6974', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'წერაქვი', 'Tserakvi', 'tserakvi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('260ec03a-30e3-49ae-892e-c1e848b44146', '9094e1fd-5a21-4a1a-bf03-6f308d90f49a', 'წყლის TDS საზომი', 'Tsqlis TDS Sazomi', 'tsqlis-tds-sazomi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('13b46a6c-041f-429f-94d7-fba972575295', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'არყის სახდელი', 'Arqis Sakhdeli', 'arqis-sakhdeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('639947a1-6ef3-4529-a12c-bb70a8006564', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ბაღის დამაფრთხობელი/ ელექტრო ღობე', 'and', 'baghis-damaprtkhobeli-elektro-ghobe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('00d4c7af-5f1a-41f8-ab01-4aa17e761d90', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ბაღის დასაქუცმაცებლები', 'and', 'baghis-dasakutsmatseblebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0d5e2308-09be-4bdb-b317-fdb70a7a7fed', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ბენზო ხერხი', 'Benzo Kherkhi', 'benzo-kherkhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a1faab27-85b6-427f-b7fd-50e132449a63', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ბუმბულის ბოილერი', 'Bumbulis Boileri', 'bumbulis-boileri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('83a9fc64-41c3-4c89-8c40-b4810b42b02a', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'გუთანი', 'Gutani', 'gutani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('947073da-3cb0-4ce1-8e69-54513d01d141', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ზეთის პრესი/საწნახელი', 'Zetis Presi Satsnakheli', 'zetis-presi-satsnakheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a54e0b16-eb5a-4898-b1a3-fc43c3216341', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'თოვლის საწმენდი მანქანები', 'Tovlis Satsmendi Mankanebi', 'tovlis-satsmendi-mankanebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5307bef3-6098-4ac9-88ab-d27627216476', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'თონე', 'Tone', 'tone', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4e29500f-6f81-454d-9f3b-92bc9c4f745d', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ინკუბატორი', 'Inkubatori', 'inkubatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba5ec4bb-c122-457b-bcd5-1d559a710c07', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'კაკლის, თხილის დანადგარი', 'and', 'kaklis-tkhilis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e827d56a-e2ba-4163-8a8d-0108e405d86b', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'მატყლის პრესი/საჩეჩი', 'Matqlis Presi Sachechi', 'matqlis-presi-sachechi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8f855423-65c5-480e-afe0-09f15fa713ec', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'მოტობლოკი, კულტივატორი', 'Motobloki Kultivatori', 'motobloki-kultivatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3d6eeb6d-f0fa-4b17-ab58-51e12e79677b', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'რძის სეფერატორი', 'Rdzis Seperatori', 'rdzis-seperatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9df085c6-366c-455d-9899-8340d48f3b3c', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'სათესი დანადგარი', 'and', 'satesi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('96c25670-9809-4e0f-8a7a-bf2d7fb63aa2', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'სათიბელა, გაზონის საკრეჭი', 'Satibela Gazonis Sakrechi', 'satibela-gazonis-sakrechi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e38db563-7c77-4031-9157-cefc5996c9ed', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'საკვების შემრევ-დამრიგებელი', 'and', 'sakvebis-shemrev-damrigebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('51f4d69e-484d-4404-9194-9a3eb275c459', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'საწველი აპარატი', 'Satsveli Aparati', 'satsveli-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ff17bdb6-d49d-495d-a915-3162e4618c9f', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'საწნახელი/ყურძნის პრესი', 'Satsnakheli Qurdznis Presi', 'satsnakheli-qurdznis-presi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2e9de9fa-1f72-42f1-8113-ee39c8b8d1ef', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'სუბპროდუქტების გადამამუშავებელი მანქანა', 'and', 'subproduktebis-gadamamushavebeli-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2386f0f3-bf10-4a35-b136-587c9c01f725', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ურემი/ურიკა/მისაბმელი', 'Uremi Urika Misabmeli', 'uremi-urika-misabmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ede262c7-5ea0-46aa-b18a-279ea798b32e', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ფრინველის საპუტი დანადგარი', 'and', 'prinvelis-saputi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('46962eda-7d8b-4f29-b1db-502040b51f60', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'ღვინის ფილტრაციის დანადგარი', 'and', 'ghvinis-piltratsiis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e8ba7b61-c683-45b2-ba7e-768c71ae4512', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'შესაწამლი აპარატი', 'Shesatsamli Aparati', 'shesatsamli-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a4a231d6-9c44-475d-b589-d1e9d64956e2', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'შეშის ღუმელი(ფეჩი)', 'Sheshis Ghumeli Pechi', 'sheshis-ghumeli-pechi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea4c631f-bc09-4e99-bb4a-48f3f747cd3c', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'შნეკი', 'Shneki', 'shneki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ab5ca283-4b46-43e1-b1dd-a8c92836c9da', 'a97566ab-5e37-43ef-997b-a2eab5e9d07b', 'წისქვილი/მარცვლეულის საფქვავი', 'Tsiskvili Martsvleulis Sapkvavi', 'tsiskvili-martsvleulis-sapkvavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ecd60adf-ed13-406f-a29b-36ff44cc910d', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'თვითმომრწყველი', 'Tvitmomrtsqveli', 'tvitmomrtsqveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c9844d74-f07d-422d-a40b-3ce90818949f', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'სარწყავი თოფი', 'Sartsqavi Topi', 'sartsqavi-topi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f0e370fc-7a09-4fb9-94b0-1609496f824d', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'სარწყავი სისტემის ტაიმერი', 'Sartsqavi Sistemis Taimeri', 'sartsqavi-sistemis-taimeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba36121b-2a1c-4409-8fa4-89c0affb5987', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'სარწყავი სურა(დოქი)', 'Sartsqavi Sura Doki', 'sartsqavi-sura-doki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('05efbc4e-d94b-4db7-a755-a9f1c88c9a20', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'სასხურებელი', 'Saskhurebeli', 'saskhurebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1be3b80b-b974-4cbd-ae88-b3fd2896d31a', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'წვეთოვანი სარწყავი სისტემა', 'Tsvetovani Sartsqavi Sistema', 'tsvetovani-sartsqavi-sistema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('01d49995-0777-4563-a9a8-e4ae771fcd3d', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'წყლის გამფრქვევი', 'Tsqlis Gamprkvevi', 'tsqlis-gamprkvevi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('273432e3-693e-4261-9675-4f62b9e599ba', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'წყლის მილი(შლანგი)', 'Tsqlis Mili Shlangi', 'tsqlis-mili-shlangi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f8cab192-391b-43d5-ba88-1cd5654d9dd7', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'წყლის მილის(შლანგის) გადასაბმელი', 'and', 'tsqlis-milis-shlangis-gadasabmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('165061e8-498f-4893-b5e5-bfe8b9c13bd3', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'წყლის მილის(შლანგის) გამყოფი', 'Tsqlis Milis Shlangis Gamqopi', 'tsqlis-milis-shlangis-gamqopi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f563ab79-cbe9-4724-84e3-7f914b671e58', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'წყლის მილის(შლანგის) კონექტორი', 'Tsqlis Milis Shlangis Konektori', 'tsqlis-milis-shlangis-konektori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aa4d7225-99fc-4b37-b616-e212148155be', '3d819dfb-128c-4e55-aae0-dfeeadb0b977', 'წყლის ტუმბო/პომპა', 'Tsqlis Tumbo Pompa', 'tsqlis-tumbo-pompa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6a6eb5ff-b4a6-43bc-ab36-867293a71819', '023de19c-1262-4346-85f9-4e36fa89945a', 'ბოთლი', 'Botli', 'botli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('128642bf-9542-43ae-b3e1-746adea14904', '023de19c-1262-4346-85f9-4e36fa89945a', 'ბოთლის საცობი/ხრახნიანი თავსახური', 'Botlis Satsobi Khrakhniani Tavsakhuri', 'botlis-satsobi-khrakhniani-tavsakhuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('afdccf80-d93d-4d30-8243-fb972b8442e6', '023de19c-1262-4346-85f9-4e36fa89945a', 'ბოცა', 'Botsa', 'botsa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c5e78cc3-5681-4526-90bf-07604c5f0f1c', '023de19c-1262-4346-85f9-4e36fa89945a', 'კასრი', 'Kasri', 'kasri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('32caf7e6-e3fa-43bf-a2ef-d76be382d615', '023de19c-1262-4346-85f9-4e36fa89945a', 'ორშიმო', 'Orshimo', 'orshimo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('698a6399-8d6a-4256-ab8f-d34fb3cedee8', '023de19c-1262-4346-85f9-4e36fa89945a', 'ტიკი', 'Tiki', 'tiki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0214fd38-0b1f-4405-8372-79176635cebc', '023de19c-1262-4346-85f9-4e36fa89945a', 'ქვევრი', 'Kvevri', 'kvevri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('581c143f-abba-48da-b1a9-6df4475c4e1e', '023de19c-1262-4346-85f9-4e36fa89945a', 'ქილა', 'Kila', 'kila', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('22695f62-0ab8-4e92-b462-2a507287b914', '023de19c-1262-4346-85f9-4e36fa89945a', 'ქილის სახუფი', 'Kilis Sakhupi', 'kilis-sakhupi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8bb10124-0757-4fac-a689-55d9f39c781d', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'დანა/ჩანგლის ნაკრები', 'and', 'dana-changlis-nakrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a29af042-e99b-44ef-9f66-748eb778923a', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'დოქი/გრაფინი', 'Doki Grapini', 'doki-grapini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d0ea8082-7929-439d-afca-297cf4183f29', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ერთჯერადი ჭურჭელი', 'Dishes', 'ertjeradi-churcheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d966298b-d123-41b5-9ac9-c4c5aad3a44f', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'თერმოჭურჭელი', 'Dishes', 'termochurcheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3a87d55a-5f31-4979-a44a-c6cf377013a1', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'თეფში', 'Tepshi', 'tepshi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('05eb0a43-593a-44c1-81dd-cb405957d75e', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'კათხა', 'Katkha', 'katkha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0d9d186a-5d9d-49e3-960b-45afe5dd577e', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'კაკლის/თხილის სატეხი', 'Kaklis Tkhilis Satekhi', 'kaklis-tkhilis-satekhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9226c331-409a-4103-bb62-eec547f0e356', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'კეცი', 'Ketsi', 'ketsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8f5c30b2-1a98-4d26-b021-80ec9e7515b2', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'კოვზი', 'Kovzi', 'kovzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9162d21f-a08e-443e-9341-247d42d29dd7', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'კურკის გამოსაცლელი', 'Kurkis Gamosatsleli', 'kurkis-gamosatsleli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('39a944f6-17c2-470f-827d-5ab7e7e53f75', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ლამბაქი', 'Lambaki', 'lambaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cbf46307-5f21-430a-a205-65f79d0d9f38', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ლარნაკი', 'Larnaki', 'larnaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0f313567-338f-484f-9c45-4e91cab5cf77', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'მარცვლეულის შესანახი ჭურჭელი', 'Dishes', 'martsvleulis-shesanakhi-churcheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ce081a45-b571-4740-b61e-c76788f6c8bf', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'სადილის სერვიზი', 'Sadilis Servizi', 'sadilis-servizi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c15ce0a5-d68a-411f-84a3-eb837128113c', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'საკვების კონტეინერი', 'Sakvebis Konteineri', 'sakvebis-konteineri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f7c4da21-f0c0-4597-92af-59de7fa020c9', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'სამზარეულო დანა', 'and', 'samzareulo-dana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e0fccd35-6217-4207-be08-40b8d3a34758', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'საპურე', 'Sapure', 'sapure', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3345d7db-86cb-47e5-a0a9-6c0d158c2e0d', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'სასალათე/ტურენი', 'Sasalate Tureni', 'sasalate-tureni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0e965d49-c1ab-47bb-94a4-428d8c58b549', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'საფერფლე', 'Saperple', 'saperple', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4e2ee7d7-e086-4b4d-a5e9-8b238bc2bf73', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'საშაქრე', 'Sashakre', 'sashakre', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9937d37e-a7fe-449f-a508-68af7249d2da', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'სუნელების/სანელებლების ქილები', 'Sunelebis Saneleblebis Kilebi', 'sunelebis-saneleblebis-kilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c31c9475-5336-41e9-a823-258931c72e0e', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ტაფა', 'Tapa', 'tapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6d8bc135-8bc7-4504-a393-942c9c725589', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ფინჯანი', 'Pinjani', 'pinjani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bec01eef-14cc-48c3-a8f4-8c37dfaa3054', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ქვაბი', 'Kvabi', 'kvabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c34257e-7867-4788-9cab-1f3a89b4b411', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ქვაბის/ტაფის თავსახური', 'Kvabis Tapis Tavsakhuri', 'kvabis-tapis-tavsakhuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('91c17ef8-3402-4f82-9fdb-1206a2bc16a1', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ყავა/ჩაის ნაკრები(სერვიზი)', 'Qava Chais Nakrebi Servizi', 'qava-chais-nakrebi-servizi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5de39933-59dc-4c83-a047-179915e50f5a', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ყანწი/ფიალა', 'Qantsi Piala', 'qantsi-piala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('10cf64b2-7980-4b8d-ab9a-6a3e5a2fcf54', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ყინულის/ ნაყინის ფორმები', 'Qinulis Naqinis Pormebi', 'qinulis-naqinis-pormebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8e4e9fbf-0066-44b8-b6b2-b6b80d4bd71d', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'შეიკერი, ბარის ჭურჭელი', 'Dishes', 'sheikeri-baris-churcheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4c624ba3-9aec-4d18-9564-e991494e3148', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ჩაის დასაყენებელი', 'and', 'chais-dasaqenebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('436fa339-2683-4a52-9752-88aeb0715adb', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'წყლის ბოთლი', 'Tsqlis Botli', 'tsqlis-botli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ceab1b4c-1960-4a4d-aac4-68cccfe26f69', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ჭიქა/ფუჟერი', 'Chika Puzheri', 'chika-puzheri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('96d3aed9-9220-4fa9-9f93-70de1560da6f', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ჭიქის სადგამი', 'Chikis Sadgami', 'chikis-sadgami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('64367ff4-07d2-499f-94eb-650921d3958f', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'ჯამი/თასი', 'Jami Tasi', 'jami-tasi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a8db6f52-1b85-47fc-a95c-9946ff168516', '668888c3-1dd1-4e5f-999d-7e8a26c49fd7', 'სამზარეულო აქსესუარები', 'Samzareulo Aksesuarebi', 'samzareulo-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5dcd2b56-a6cd-494f-9fc7-4f4356b2c28a', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'ბოთლის/ქილის სახსნელი', 'Botlis Kilis Sakhsneli', 'botlis-kilis-sakhsneli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('933fdaea-5ee5-43f3-9433-298016ba135a', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'ბოსტნეულის საფცქვნელი/საჭრელი', 'Bostneulis Saptskvneli Sachreli', 'bostneulis-saptskvneli-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a8a3b8a1-9009-4c20-aa42-966fd0004b2a', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'ბოსტნეულის სახეხი', 'Bostneulis Sakhekhi', 'bostneulis-sakhekhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7db2a04c-543c-4d06-b8d1-15c35824079a', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'თანმხლები პროდუქცია (ფოლგები, სახელოები)', 'Tanmkhlebi Produktsia Polgebi Sakheloebi', 'tanmkhlebi-produktsia-polgebi-sakheloebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0966f3f9-2ae9-428c-ab01-f061abd727db', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამარილე/საპილპილე', 'Samarile Sapilpile', 'samarile-sapilpile', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b00d6b44-0a22-4fb9-a72c-934e9b5e4b31', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამზარეულო აქსესუარების ნაკრები', 'Samzareulo Aksesuarebis Nakrebi', 'samzareulo-aksesuarebis-nakrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0e0577b8-9e59-446b-b0e7-e0fff9432a44', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამზარეულო აქსესუარების ორგანაიზერი', 'Samzareulo Aksesuarebis Organaizeri', 'samzareulo-aksesuarebis-organaizeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b941e2da-40e0-4b25-a319-bdf5441fea7b', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამზარეულო მაკრატელი', 'Samzareulo Makrateli', 'samzareulo-makrateli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('addae6d1-7a68-4a0f-a5ee-e10c425c8278', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამზარეულო საცერი/საწური', 'Samzareulo Satseri Satsuri', 'samzareulo-satseri-satsuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b965765a-043c-45a3-8aae-1ce7658f859b', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამზარეულო ძაბრი', 'Samzareulo Dzabri', 'samzareulo-dzabri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4340557a-1da3-4c22-8f52-448efada46fa', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამზარეულო წინსაფარი', 'Samzareulo Tsinsapari', 'samzareulo-tsinsapari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('68c712d6-8148-4699-8007-2f7c9cd13efe', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სამზარეულო ხელთამანი', 'Samzareulo Kheltamani', 'samzareulo-kheltamani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('58a73ed4-7075-48e4-9bab-eb6f82c211c2', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'სანაყი/საჭყლეტი', 'Sanaqi Sachqleti', 'sanaqi-sachqleti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ce93cf4f-9749-474d-9244-b79703045d40', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'საცხობი ფორმა/ლანგარი', 'Satskhobi Porma Langari', 'satskhobi-porma-langari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a28f029f-ec62-4739-98ea-fc8b5729ca01', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'საჭრელი დაფა', 'and', 'sachreli-dapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('47da3c62-898e-4643-b215-2ef68865e92b', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'ჭურჭლის საშრობი', 'Churchlis Sashrobi', 'churchlis-sashrobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1afe19a9-9280-4651-b772-1fd6ad6a4f20', 'a8db6f52-1b85-47fc-a95c-9946ff168516', 'ხელის სლაისლერი/საჭრელი', 'Khelis Slaisleri Sachreli', 'khelis-slaisleri-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3614ef8b-4734-4532-9a9a-29f0cada4ff9', '09022897-a606-4c3e-95bc-3e4dccd642bd', 'გველი', 'Gveli', 'gveli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e86918f3-d4a5-4a5e-90f1-401db4a1b4f1', '09022897-a606-4c3e-95bc-3e4dccd642bd', 'კუ', 'Ku', 'ku', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e4eb2aba-09f0-4ac2-b0f7-070f8593aba1', '09022897-a606-4c3e-95bc-3e4dccd642bd', 'ხვლიკი', 'Khvliki', 'khvliki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a5df8b5f-a252-4da2-a9f3-a25f9e58bdc9', '8cbaed0c-06ca-428b-bdf9-31ae9ba30be1', 'ამადინი', 'Amadini', 'amadini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ed96305-c4c3-4274-b29f-485801058e7c', '8cbaed0c-06ca-428b-bdf9-31ae9ba30be1', 'თუთიყუში', 'Tutiqushi', 'tutiqushi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d9ce75aa-d9fd-4267-9ad4-b6c60515ba75', '8cbaed0c-06ca-428b-bdf9-31ae9ba30be1', 'იადონი', 'Iadoni', 'iadoni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('32789b97-e18b-417c-8218-608c8e32634e', '8cbaed0c-06ca-428b-bdf9-31ae9ba30be1', 'მტრედი', 'Mtredi', 'mtredi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('019be1c4-ddcd-48ac-b388-24f2f7c33b7f', '8cbaed0c-06ca-428b-bdf9-31ae9ba30be1', 'სირაქლემა', 'Siraklema', 'siraklema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('278fbe9c-32b1-4156-aff1-46cf85551d44', '8cbaed0c-06ca-428b-bdf9-31ae9ba30be1', 'ფარშევანგი', 'Parshevangi', 'parshevangi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6a68a21f-ce51-4b33-9b25-d55001c2bdb0', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'ძროხა/ხარი', 'Dzrokha Khari', 'dzrokha-khari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('87d5cdff-240b-4228-a3fd-9cbc4fe42380', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'ბატი', 'Bati', 'bati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c120e3f0-d56c-4e9d-8828-3f3ebc6e6977', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'გნოლი', 'Gnoli', 'gnoli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fd94015e-f841-42bb-966d-cca0b419f43d', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'ინდაური', 'and', 'indauri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2c7cb7fd-24a1-42ac-83e3-f2ee2b15a17d', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'იხვი', 'Ikhvi', 'ikhvi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2984ab14-032b-418c-9d20-c2a38e53b066', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'კაკაბი', 'Kakabi', 'kakabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('84653e31-6156-450c-9dc9-ada2abf10de1', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'მწყერი', 'Mtsqeri', 'mtsqeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7ccdf575-50a9-4a33-92f8-bb2b547841e3', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'ქათამი', 'Katami', 'katami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c4f5fb68-e393-476b-9c3a-746a64eddc47', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'ციცარი', 'Tsitsari', 'tsitsari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e7cc6616-81e0-4abd-9afe-0e162e3846a1', '21e3a9ef-7da3-4832-ad4f-921935bf2c55', 'ხოხობი', 'Khokhobi', 'khokhobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('639b0ced-95da-4d01-bdb8-690b4cc32b59', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'სკა', 'Ska', 'ska', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b86020e-36bd-453c-9e48-eaf4c3b1cf84', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'თაფლსაწური', 'Taplsatsuri', 'taplsatsuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bf348f31-3de8-4694-9611-8a6a214fa740', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'ჯენტერის ჩარჩო (სადედე)', 'Jenteris Charcho Sadede', 'jenteris-charcho-sadede', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cf28c011-6610-4738-a2ea-f61afed47674', '13288140-dbdf-4322-951c-cd49dd4d5ca5', 'ეგზოტიკური ცხოველების/ფრინველების საკვები', 'Animals', 'egzotikuri-tskhovelebis-prinvelebis-sakvebi', '🐾', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e7247936-86d9-41c0-91a7-a977258925db', '13288140-dbdf-4322-951c-cd49dd4d5ca5', 'თევზის საკვები', 'Tevzis Sakvebi', 'tevzis-sakvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4a27f18b-d0d9-4a2d-939b-472080321285', '13288140-dbdf-4322-951c-cd49dd4d5ca5', 'კატის საკვები', 'Katis Sakvebi', 'katis-sakvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d42e8a95-b1cd-4f92-9a6f-076509f11ca5', '13288140-dbdf-4322-951c-cd49dd4d5ca5', 'მღრღნელების საკვები', 'Mghrghnelebis Sakvebi', 'mghrghnelebis-sakvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e34eedb9-d873-440b-9d69-58a2a47b3cd2', '13288140-dbdf-4322-951c-cd49dd4d5ca5', 'ფრინველის საკვები', 'Prinvelis Sakvebi', 'prinvelis-sakvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80aac6d0-3d23-40b8-a3aa-a7acc9ce22df', '13288140-dbdf-4322-951c-cd49dd4d5ca5', 'ჩლიქოსნების საკვები', 'Chlikosnebis Sakvebi', 'chlikosnebis-sakvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2427dbca-171b-4e65-86f8-824c613e7872', '13288140-dbdf-4322-951c-cd49dd4d5ca5', 'ძაღლის საკვები', 'Dzaghlis Sakvebi', 'dzaghlis-sakvebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('86bf1d2e-46ba-490f-9f56-52914ef35d64', '3e791f05-5285-4df8-a093-8b75aff78a29', 'ანტიპარაზიტული საშუალება', 'Antiparazituli Sashualeba', 'antiparazituli-sashualeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8c66b08f-aec0-4f63-89c7-404825ae8e92', '3e791f05-5285-4df8-a093-8b75aff78a29', 'ელექსირი', 'Eleksiri', 'eleksiri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f581a50a-452d-4b1d-81b6-5757a523f82d', '3e791f05-5285-4df8-a093-8b75aff78a29', 'ვეტერინარული თერმომეტრი', 'Veterinaruli Termometri', 'veterinaruli-termometri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7880bf92-2c88-4804-9f9b-b8980be6b2ac', '3e791f05-5285-4df8-a093-8b75aff78a29', 'ვეტერინარული ხელსაწყოები', 'Veterinaruli Khelsatsqoebi', 'veterinaruli-khelsatsqoebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a3bbae9a-bcfc-4324-97d8-d2c8fa28095f', '3e791f05-5285-4df8-a093-8b75aff78a29', 'ვიტამინი', 'Vitamini', 'vitamini', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3a773825-6bed-4c79-890e-146cfeca7483', '3e791f05-5285-4df8-a093-8b75aff78a29', 'თათის/ფეხის ფიქსატორი', 'Tatis Pekhis Piksatori', 'tatis-pekhis-piksatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d5d6af11-5ae5-41b1-8cfe-afa6506cc841', '3e791f05-5285-4df8-a093-8b75aff78a29', 'მალამო', 'Malamo', 'malamo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('855eddcc-74fb-467c-8be2-749a9b062be1', '3e791f05-5285-4df8-a093-8b75aff78a29', 'საკვები დანამატი', 'and', 'sakvebi-danamati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e04143f5-1a3b-4fc5-b5bf-59fd38e55083', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'ალიკაპი', 'Alikapi', 'alikapi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9b9dadc6-89d8-455e-a62d-7034b1c2c7b8', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'აღკაზმულობა', 'Aghkazmuloba', 'aghkazmuloba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('daf777f0-c6f0-4536-8831-58f804deb3c6', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'გადასაყვანი ჩანთა/კონტეინერი', 'and', 'gadasaqvani-chanta-konteineri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fe42c537-d174-4e64-a0df-7b28e5aae1a3', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'გალია', 'Galia', 'galia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('70bce592-4816-42f7-ac70-4d1aad0850ad', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'ელექტრო საყელო', 'Elektro Saqelo', 'elektro-saqelo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0f4e8daa-ec92-4439-a59d-469a8d5ee170', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'თათების გასაწმენდი ჭიქა', 'Tatebis Gasatsmendi Chika', 'tatebis-gasatsmendi-chika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e10eb425-1e60-4444-ba18-82ec9804943b', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'საბელი', 'Sabeli', 'sabeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80f64ed2-18ec-4b64-b377-a980ab942a17', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'სათამაშო', 'Satamasho', 'satamasho', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bf576ca1-0aef-4ba3-be47-2495eb1ba1a9', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'საკვებური/საწყურებელი', 'Sakveburi Satsqurebeli', 'sakveburi-satsqurebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8b29efb8-5566-4da6-a880-947df32801ab', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'საკრეჭი/დუქარდი', 'Sakrechi Dukardi', 'sakrechi-dukardi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8ecc1ceb-cec3-4d72-aff3-8736294aaa79', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'საყელო', 'Saqelo', 'saqelo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f51bc50a-9d69-4641-a7cd-2afcd37075c7', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'სახლი/საწოლი', 'Sakhli Satsoli', 'sakhli-satsoli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('74bd2acc-3ac5-47a7-a139-5db6f9ec2703', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'ტანსაცმელი', 'Tansatsmeli', 'tansatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5ea3b67a-8037-4af1-bf6c-163d8dd778a7', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'ტერარიუმი', 'Terariumi', 'terariumi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2bb1a2e2-48c7-418d-b395-8de85eec7115', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'ცხოველების დასანიშნი/იდენტიფიკატორი', 'Animals', 'tskhovelebis-dasanishni-identipikatori', '🐾', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('28c78a3a-c558-43c1-8e96-86c586000e3f', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'ძაღლის საწვრთნელი სასტვენი', 'Dzaghlis Satsvrtneli Sastveni', 'dzaghlis-satsvrtneli-sastveni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80f4a9c2-28c4-4d1f-84bf-611fa3645549', 'cb5a60fe-073a-48ec-b06d-b0b7cdc5517c', 'მაკრატელი ცხოველებისთვის', 'Animals', 'makrateli-tskhovelebistvis', '🐾', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4b2b2beb-32d7-4014-8df5-780a63a75f64', 'cb5a60fe-073a-48ec-b06d-b0b7cdc5517c', 'სავარცხელი', 'Savartskheli', 'savartskheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cd3fb769-d50e-40a9-99d6-a6a69530348c', 'cb5a60fe-073a-48ec-b06d-b0b7cdc5517c', 'საპირფარეშო', 'Sapirparesho', 'sapirparesho', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('257e4c29-3b6e-4971-af8e-8c10febdd0ec', 'cb5a60fe-073a-48ec-b06d-b0b7cdc5517c', 'შამპუნი', 'Shampuni', 'shampuni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a0b6becf-2ba7-4d38-8e59-e805455b26b2', 'cb5a60fe-073a-48ec-b06d-b0b7cdc5517c', 'ცხოველების საკრეჭი', 'Animals', 'tskhovelebis-sakrechi', '🐾', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('92f09303-a44a-4927-8ced-4c4fe383b0c4', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილური სტაბილიზატორი ', 'Mobiluri Stabilizatori', 'mobiluri-stabilizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ec146e4c-1687-4406-97fb-85c1da8062f6', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის GSM მიმღების გამაძლიერებელი', 'Mobiluris GSM Mimghebis Gamadzlierebeli', 'mobiluris-gsm-mimghebis-gamadzlierebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('872cc1fa-cd77-46e3-8f08-815d28e1a7be', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის VR ბოქსი', 'Mobiluris VR Boksi', 'mobiluris-vr-boksi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d0e0e8a6-b3ed-45cd-9e4e-7582a273fc87', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის განათება/რინგლაითი', 'Mobiluris Ganateba Ringlaiti', 'mobiluris-ganateba-ringlaiti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('90397104-3df0-40ed-8996-74141d9f425e', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის გეიმპადი/კონტროლერი', 'Mobiluris Geimpadi Kontroleri', 'mobiluris-geimpadi-kontroleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aff98ec2-6217-4485-9acd-94822d721b21', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის დამტენი ბლოკი', 'and', 'mobiluris-damteni-bloki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ae396676-813b-46fa-b4a3-a1cd48e42f19', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის დამცავი/ბრონი', 'and', 'mobiluris-damtsavi-broni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c917fea-0b39-4ba3-801f-16e967f747b6', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის კაბელი/გადამყვანი', 'and', 'mobiluris-kabeli-gadamqvani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb4433f7-0416-4cdd-9b5f-5879bd8ea09c', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის კამერის ლინზა', 'Mobiluris Kameris Linza', 'mobiluris-kameris-linza', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('52865e97-cbbe-4e00-aff0-763e53a8d445', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის მიკროსკოპი', 'Mobiluris Mikroskopi', 'mobiluris-mikroskopi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d3b1ead9-bbff-4c0d-80fb-1ab891425595', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის სამაგრი', 'Mobiluris Samagri', 'mobiluris-samagri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('109a5752-6a7e-45f8-b557-1157a9e3346b', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის უცნაური გაჯეტები', 'Mobiluris Utsnauri Gajetebi', 'mobiluris-utsnauri-gajetebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9cac12e0-4a38-4dca-bf11-fa22bb640d02', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის ქეისი/შალითა', 'Mobiluris Keisi Shalita', 'mobiluris-keisi-shalita', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('62c2f75f-51f7-4a5c-9826-262c64ef8ff2', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის ქულერი', 'Mobiluris Kuleri', 'mobiluris-kuleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3a755070-7365-4a81-828b-c01cd4561744', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'მობილურის შტატივი', 'Mobiluris Shtativi', 'mobiluris-shtativi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0ba80fc9-6c48-4a83-aeda-ffe2dc8358be', 'f98b90de-f0e4-4cfd-9fa5-4a1e6f929ab8', 'სელფის ჯოხი', 'Selpis Jokhi', 'selpis-jokhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ca5bd280-a952-4901-8cfc-533892cf03b4', '335c31e0-d86a-4062-9999-68807f282fe0', 'მობილურის აკუმულატორი', 'Mobiluris Akumulatori', 'mobiluris-akumulatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('03035bf3-6bd8-43d2-a6fe-695c77779e53', '335c31e0-d86a-4062-9999-68807f282fe0', 'მობილურის დედადაფა', 'and', 'mobiluris-dedadapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('456fe6d2-efce-4354-b95e-e27e8533bbae', '335c31e0-d86a-4062-9999-68807f282fe0', 'მობილურის ეკრანი', 'Mobiluris Ekrani', 'mobiluris-ekrani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bfa22f63-4009-4843-bf8e-13899adb6cac', '335c31e0-d86a-4062-9999-68807f282fe0', 'მობილურის კორპუსი/კლავიატურა', 'Mobiluris Korpusi Klaviatura', 'mobiluris-korpusi-klaviatura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4dff0117-6486-4580-8812-977d0d2483b3', '335c31e0-d86a-4062-9999-68807f282fe0', 'მობილურის ღილაკი', 'Mobiluris Ghilaki', 'mobiluris-ghilaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e93327ce-c042-41ae-b0dc-27c732439c85', '335c31e0-d86a-4062-9999-68807f282fe0', 'სიმ ბარათის/ჩიპი სლოტი', 'Sim Baratis Chipi Sloti', 'sim-baratis-chipi-sloti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8c5d339e-e60d-402f-a560-a0ada859e094', '335c31e0-d86a-4062-9999-68807f282fe0', 'ტურბოსიმი', 'Turbosimi', 'turbosimi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bc70fe49-d681-4b02-a5d9-b399c586d32a', 'fb5e2c93-e3f0-4c43-8503-dd90861539de', 'GPS ტრეკერი', 'GPS Trekeri', 'gps-trekeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('272946be-e2d2-4a61-b0b6-f8a3a09f77f1', '487e4cc7-bd22-4936-8ce4-be93ce2b4eff', 'ფაქსი', 'Paksi', 'paksi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5264ffec-d702-4ad8-a060-97e9bf0bccfa', 'cf0335e3-c07c-4011-bf87-c73a674aa77e', 'გეიმინგ მაგიდა', 'and', 'geiming-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ba9b7202-ebde-41e3-a9f8-3e961571974a', 'cf0335e3-c07c-4011-bf87-c73a674aa77e', 'გეიმინგ მონიტორის სადგამი', 'Geiming Monitoris Sadgami', 'geiming-monitoris-sadgami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6fd2889c-38de-4c95-b355-7817633afed7', 'bc79bc68-fd52-4e45-823f-b7bcfbf598ba', 'კომპიუტერული თამაში', 'Kompiuteruli Tamashi', 'kompiuteruli-tamashi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a2b5ace1-f67d-47a9-afdf-24585214054e', 'bc79bc68-fd52-4e45-823f-b7bcfbf598ba', 'სათამაშო კონსოლი', 'Satamasho Konsoli', 'satamasho-konsoli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('328e7c8f-8762-4856-8d1f-f7fd0134e17c', 'ea8aad26-cd8f-428f-b208-d8f355b8cf87', 'აბრეშუმი', 'Abreshumi', 'abreshumi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f1d17e58-a70d-4f00-83eb-d8aca3407d6c', 'ea8aad26-cd8f-428f-b208-d8f355b8cf87', 'ბუმბული', 'Bumbuli', 'bumbuli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d3af3c51-9444-430c-a78a-576c489ec1d6', 'ea8aad26-cd8f-428f-b208-d8f355b8cf87', 'მატყლი', 'Matqli', 'matqli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('30d6b5b8-ac4b-4172-959e-47ca3f20b239', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორის 3D სათვალე', 'Proektoris 3D Satvale', 'proektoris-3d-satvale', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('97e4b0ef-95cc-4751-bb35-e97b91ad2145', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორის საკიდი/სადგამი', 'Proektoris Sakidi Sadgami', 'proektoris-sakidi-sadgami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b4518138-3775-4ef2-9b8f-23cf9ea5ecfd', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'სკანერი', 'Skaneri', 'skaneri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8c333d2a-2200-4d19-bb87-9ebe8707db76', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'პრინტერის ნაწილები', 'Printer', 'printeris-natsilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0853e5a8-6c85-4dfc-abed-a8882653598c', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'კლავიატურა', 'Klaviatura', 'klaviatura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('33c17edb-1354-4d8c-b52b-cbc6223a7982', 'fa1192dd-94fe-41ae-aefc-885e2e6a0296', 'ელ. ტექნიკის აკუმულატორი', 'El Teknikis Akumulatori', 'el-teknikis-akumulatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('12d97b1d-c384-4035-bb90-dbdb5ea5b5a0', 'fa1192dd-94fe-41ae-aefc-885e2e6a0296', 'ელემენტი', 'Elementi', 'elementi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8d9f0dcf-2f4e-4610-a898-915d3f001e0c', 'fa1192dd-94fe-41ae-aefc-885e2e6a0296', 'ელემენტის დამტენი', 'and', 'elementis-damteni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b38fb16b-6541-4c16-bf04-bba2702f8e31', '7026e25e-f491-4076-8d95-0915b17a6a8e', 'პროფესიონალური სამზარეულოს დანადგარები/ატრიბუტები', 'and', 'propesionaluri-samzareulos-danadgarebi-atributebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80d2d816-3387-4eb2-bd00-5d76c71f3c4d', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'პიცის ასაღები ნიჩაბი', 'Pitsis Asaghebi Nichabi', 'pitsis-asaghebi-nichabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b8f8e902-43a3-49a6-a4b9-a6a4c4a31d90', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'პიცის ღუმელის ჯაგრისი', 'Pitsis Ghumelis Jagrisi', 'pitsis-ghumelis-jagrisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('073f8b0c-bccb-4eda-8b76-923e93435fb7', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო დანა', 'and', 'samretsvelo-dana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f4ad3aff-da26-43ec-a272-e555e7a4a0d6', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო დახლი', 'and', 'samretsvelo-dakhli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e1241c6a-d6c6-45cd-9a15-0bb031f20d00', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო კვების პროდუქტების შესაფუთი მასალა', 'Samretsvelo Kvebis Produktebis Shesaputi Masala', 'samretsvelo-kvebis-produktebis-shesaputi-masala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ab7b91c0-0ec6-4276-baca-58af6c7bdb6c', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო კონტეინერი', 'Samretsvelo Konteineri', 'samretsvelo-konteineri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('776e55ee-c36e-4292-99fd-ccb207b75baf', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო საცხობი ფორმა/ლანგარი', 'Samretsvelo Satskhobi Porma Langari', 'samretsvelo-satskhobi-porma-langari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2b217420-38ad-4915-a93e-e7ee39ace008', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო საჭრელი დაფა', 'and', 'samretsvelo-sachreli-dapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('10c52633-1bff-44ac-997c-ef56bf711d47', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო სკამი', 'Samretsvelo Skami', 'samretsvelo-skami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8a402eeb-49fe-4414-ace0-62a9cf34c944', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო სოუსების დისპენსერი', 'Samretsvelo Sousebis Dispenseri', 'samretsvelo-sousebis-dispenseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c6b8c04c-b750-4293-b487-90e3139be8e9', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო ტაფა', 'Samretsvelo Tapa', 'samretsvelo-tapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('07a42203-132a-40a9-b8fd-4e00b491ea78', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო ფუსფუსა (ფარსუნკა)', 'Samretsvelo Puspusa Parsunka', 'samretsvelo-puspusa-parsunka', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('20d1a703-5f5f-4484-beb1-a022328fad92', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო ქვაბი', 'Samretsvelo Kvabi', 'samretsvelo-kvabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('415af46b-1ee9-45d5-8a96-4610673b3846', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სამრეწველო წყლის დამარბილებელი', 'and', 'samretsvelo-tsqlis-damarbilebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80a99bb4-9bc4-447e-afba-6d2d8df3c0e4', 'ac56259a-87e8-4031-b51c-660c29b6de13', 'სილიკონის ცეცხლგამძლე პროფილები', 'Silikonis Tsetskhlgamdzle Propilebi', 'silikonis-tsetskhlgamdzle-propilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b964b314-8279-4166-8b68-09ec05bdb707', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'გამაგრილებელი სასმელის სამრეწველო დანადგარი', 'Beverage', 'gamagrilebeli-sasmelis-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('de71fda8-9c96-4d6b-acbd-fd3ccb3d05fe', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'ლუდის სამრეწველო დისპენსერი/დანადგარი', 'and', 'ludis-samretsvelo-dispenseri-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cbd977ca-e390-41c4-afa2-bde50bd15981', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'მარცვლეულის სამრეწველო გასაღვივებელი', 'Martsvleulis Samretsvelo Gasaghvivebeli', 'martsvleulis-samretsvelo-gasaghvivebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a6fab80d-f77a-40f4-a1bb-2e1026d9c2d9', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'პროფესიონალური სამზარეულოს დანადგარების კომპლექტები', 'and', 'propesionaluri-samzareulos-danadgarebis-komplektebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8767c888-4408-452c-8dcd-6baa47cf87ba', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო ამაორთქლებელი', 'Samretsvelo Amaortklebeli', 'samretsvelo-amaortklebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('681974d4-36f4-433a-b80c-c8409f332c84', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო ბლენდერი', 'Samretsvelo Blenderi', 'samretsvelo-blenderi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('db824cec-5d62-4846-a265-9e9ce27adf7c', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო დამფასოვებელი დანადგარი', 'and', 'samretsvelo-dampasovebeli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('22762ad7-bb87-4cd5-9dc7-e73033dc238a', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო დანების სტერილიზატორი', 'and', 'samretsvelo-danebis-sterilizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c3513cd-1357-41a5-8bf0-97ad1b2ff2eb', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო ვაკუუმის დანადგარი', 'and', 'samretsvelo-vakuumis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f164c9a0-ab2a-4a49-acaf-d4f6f539db0f', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო თარიღატორი', 'Samretsvelo Tarighatori', 'samretsvelo-tarighatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f8c61236-d2d5-4ede-b11b-bc55c1a258ec', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო მიქსერი', 'Samretsvelo Mikseri', 'samretsvelo-mikseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ce010885-db6c-48b6-a670-d1816753bac9', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო ტოსტერი', 'Samretsvelo Tosteri', 'samretsvelo-tosteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fea5c53c-f507-4a62-be73-c15b1fd42337', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო შადრევანი', 'Samretsvelo Shadrevani', 'samretsvelo-shadrevani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c67936b8-b817-4eea-a048-c2f31f5a763b', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო შესაფუთი დანადგარი', 'and', 'samretsvelo-shesaputi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c10577f-576e-450c-8e3d-a59fbe9c2041', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო ჩამოსასხმელი დანადგარი', 'and', 'samretsvelo-chamosaskhmeli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('31bfccef-eb9e-43fa-92d7-d46c7a43ec4c', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სნექის ბოქსი', 'Snekis Boksi', 'snekis-boksi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c3cb15d3-bb20-4653-bffa-e2fcbb11c8f2', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'ყავის მოსახალი დანადგარი', 'and', 'qavis-mosakhali-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02d1f5c6-a71f-4a9e-ba82-4a00f1c9a3d8', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'ყავის სამრეწველო აპარატი', 'Qavis Samretsvelo Aparati', 'qavis-samretsvelo-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4660c924-dabd-4b6b-ad6b-939caca1f38e', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'ყინულის სამრეწველო დანადგარი', 'and', 'qinulis-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0295521d-1444-4322-ae83-a385df3f2809', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'ცხიმსაჭერი', 'Tskhimsacheri', 'tskhimsacheri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a897dfe7-9b10-4e13-b499-d3edab17b4ad', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'ჭიქის სამრეწველო დასალუქი დანადგარი', 'and', 'chikis-samretsvelo-dasaluki-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b3ce0cb8-2cbc-44f5-8907-478b404a3020', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'რძის პროდუქტების სამრეწველო დანადგარები', 'and', 'rdzis-produktebis-samretsvelo-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bf7c22df-a8a4-4b3b-8f3a-bedc419353b8', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო საფრცქვნელი/სარჩევი დანადგარები', 'and', 'samretsvelo-saprtskvneli-sarchevi-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d7a2ccf1-0763-4583-971b-523562ef06e4', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო თერმო დანადგარები', 'and', 'samretsvelo-termo-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('29de71f4-0732-4bf8-a3cf-7b945b027394', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო საფქვავი დანადგარები', 'and', 'samretsvelo-sapkvavi-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04e1b8d8-48e6-4b14-97c9-45b59482c938', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო ხილის/ბოსტნეულის დანადგარები', 'and', 'samretsvelo-khilis-bostneulis-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d560d641-ac21-4a02-8908-2cd70beedf34', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო საცხობი დანადგარები', 'and', 'samretsvelo-satskhobi-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b3647e9-81d6-4efb-9f3d-06a5f642d5ad', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო საჭრელი დანადგარები', 'and', 'samretsvelo-sachreli-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4943131b-53d5-429d-9b3d-79d03c505a8e', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო სახარში დანადგარი', 'and', 'samretsvelo-sakharshi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6871a3bf-b824-4e88-bd30-f726e0bb18fd', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო ხორცპროდუქტების დასამზადებელი დანადგარები', 'and', 'samretsvelo-khortsproduktebis-dasamzadebeli-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('45e45048-3938-4fdd-a519-8b52bd9f2fab', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო დანადგარები ცომისთვის', 'and', 'samretsvelo-danadgarebi-tsomistvis', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('afad7828-bee2-4b8f-aba6-81cc783f126e', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო შესაწვავი დანადგარები', 'and', 'samretsvelo-shesatsvavi-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო დესერტის დანადგარები', 'and', 'samretsvelo-desertis-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('82f5114a-ed08-4c27-b354-19503acfebb2', 'b38fb16b-6541-4c16-bf04-bba2702f8e31', 'სამრეწველო სივრცე ', 'Samretsvelo Sivrtse', 'samretsvelo-sivrtse', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4bfeb200-d9fe-42f7-a935-d3fd8a8f65f0', 'd7a2ccf1-0763-4583-971b-523562ef06e4', 'საკვების გრილად შესანახი დანადგარი ', 'and', 'sakvebis-grilad-shesanakhi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('07b51f43-24af-4f42-ade2-877715068ea8', 'd7a2ccf1-0763-4583-971b-523562ef06e4', 'საკვების თბილად შესანახი დანადგარი ', 'and', 'sakvebis-tbilad-shesanakhi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4fd4418e-2935-468c-8c8f-c51b5a5546ce', 'd7a2ccf1-0763-4583-971b-523562ef06e4', 'სამრეწველო თერმოსი/მადუღარა', 'Samretsvelo Termosi Madughara', 'samretsvelo-termosi-madughara', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('03f9afe8-4966-4a19-aa40-3d0cafdf4405', 'd560d641-ac21-4a02-8908-2cd70beedf34', 'კონვექციური ღუმელი', 'Konvektsiuri Ghumeli', 'konvektsiuri-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d437a51d-0558-4d6b-b840-33948cc3f15f', 'd560d641-ac21-4a02-8908-2cd70beedf34', 'პიცის ღუმელი', 'Pitsis Ghumeli', 'pitsis-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('48e89ba0-da9e-4c62-829e-04b29efd6ce6', 'd560d641-ac21-4a02-8908-2cd70beedf34', 'სამრეწველო მიკროტალღური ღუმელი', 'Samretsvelo Mikrotalghuri Ghumeli', 'samretsvelo-mikrotalghuri-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('39dca938-f1b5-4dcd-8f4f-644841c0f74e', 'd560d641-ac21-4a02-8908-2cd70beedf34', 'სამრეწველო ღუმელი', 'Samretsvelo Ghumeli', 'samretsvelo-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6cfb23b6-a6f7-43b1-8ff1-be2294b9ffdf', 'd560d641-ac21-4a02-8908-2cd70beedf34', 'ფერმენტაციის ღუმელი', 'Permentatsiis Ghumeli', 'permentatsiis-ghumeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f8ede600-fbf3-4497-9187-cd5247bbe4ea', '45e45048-3938-4fdd-a519-8b52bd9f2fab', 'პელმენის/ხინკლის შესახვევი დანადგარი', 'and', 'pelmenis-khinklis-shesakhvevi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('818cfe9a-5197-40d8-8443-5eb50ff5c7c5', '45e45048-3938-4fdd-a519-8b52bd9f2fab', 'სამრეწველო ცომსაზელი', 'Samretsvelo Tsomsazeli', 'samretsvelo-tsomsazeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dace129f-91d8-48f4-818a-25b5daba9fb5', '45e45048-3938-4fdd-a519-8b52bd9f2fab', 'ფქვილის საცრელი სამრეწველო დანადგარი', 'and', 'pkvilis-satsreli-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('05c92489-6596-42ea-9512-5d8ba5c63a6e', '45e45048-3938-4fdd-a519-8b52bd9f2fab', 'ცომის გუნდის დასალაგებელი', 'and', 'tsomis-gundis-dasalagebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37359355-0030-4add-b6e8-935bb3a53417', '45e45048-3938-4fdd-a519-8b52bd9f2fab', 'ცომის საგუნდავებელი', 'and', 'tsomis-sagundavebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5376c2ba-58f6-4a98-9f7f-94146dd0d450', '45e45048-3938-4fdd-a519-8b52bd9f2fab', 'ცომის სამრეწველო პრესი', 'Tsomis Samretsvelo Presi', 'tsomis-samretsvelo-presi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3cbd9cc3-d101-44f3-bb77-8ce13cdb352b', '45e45048-3938-4fdd-a519-8b52bd9f2fab', 'ცომის სამრეწველო საჭრელი', 'Tsomis Samretsvelo Sachreli', 'tsomis-samretsvelo-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac43d9a7-8fd0-46b3-8b8a-f540fbd21f85', '6871a3bf-b824-4e88-bd30-f726e0bb18fd', 'სამრეწველო ხორცსაკეპი', 'Samretsvelo Khortssakepi', 'samretsvelo-khortssakepi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('653e8ba5-9829-4058-b181-372df57b3311', '6871a3bf-b824-4e88-bd30-f726e0bb18fd', 'სოსისის დასამზადებელი დანადგარი', 'and', 'sosisis-dasamzadebeli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1051f5ad-5226-45cc-9b51-c96392e72a67', '6871a3bf-b824-4e88-bd30-f726e0bb18fd', 'ფარშის ამრევი დანადგარი', 'and', 'parshis-amrevi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9ba02b23-52a6-4097-95bb-6aba3ae575cf', '6871a3bf-b824-4e88-bd30-f726e0bb18fd', 'ძეხვის/კუპატის დასამზადებელი დანადგარი', 'and', 'dzekhvis-kupatis-dasamzadebeli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5bd835e0-17f3-4917-9801-878f59635ec5', '6871a3bf-b824-4e88-bd30-f726e0bb18fd', 'ხორცის მასაჟორი', 'Khortsis Masazhori', 'khortsis-masazhori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('887acb12-bc27-4a80-a9cc-f54f6a9f7df8', '6871a3bf-b824-4e88-bd30-f726e0bb18fd', 'ხორცის პრესი', 'Khortsis Presi', 'khortsis-presi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('184ec326-6fbc-4140-979b-670eb0f946d9', 'b3ce0cb8-2cbc-44f5-8907-478b404a3020', 'რძის პასტერიზატორი', 'Rdzis Pasterizatori', 'rdzis-pasterizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e08a2d34-c80c-4fd3-b638-619cfcbef4eb', 'b3ce0cb8-2cbc-44f5-8907-478b404a3020', 'სოიოს რძის მიმღები დანადგარი მცენარეული ყველის წარმოებისთვის (ტოფუ)', 'and', 'soios-rdzis-mimghebi-danadgari-mtsenareuli-qvelis-tsarmoebistvis-topu', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('69c0827d-6a2a-4f60-aa14-9e2fef7e0d7f', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'ბამბის ნაყინის დანადგარი', 'and', 'bambis-naqinis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1b826e71-2012-42fe-a8bb-2d37430f093e', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'ბატი-ბუტის დანადგარი', 'and', 'bati-butis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('261a4b9d-a807-4f9e-8cb1-d8e4767aa36d', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'ბლითების დანადგარი', 'and', 'blitebis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37ed59bf-af58-4d68-bd8f-dba57436cf0d', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'დასაკრემი დანადგარი', 'and', 'dasakremi-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5f038358-7486-46bc-9cd0-beac3ebc7132', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'დონატის დანადგარი', 'and', 'donatis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('58a36484-5986-4bfa-89ec-33591e46a3ba', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'ვაფლის დანადგარი', 'and', 'vaplis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f883ca8f-8d44-446a-a81e-48fd8e78628a', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'კრეპის დანადგარი', 'and', 'krepis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9d50ad31-f88c-40f7-b717-9938497034cf', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'ნაყინის დანადგარი', 'and', 'naqinis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ee6a5d4c-64b3-427f-b0fa-cf5f81b33635', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'სამრეწველო საკონდიტრო დანადგარი', 'and', 'samretsvelo-sakonditro-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9c197a59-463f-4696-9b9a-add3de956461', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'ჩირის დანადგარი', 'and', 'chiris-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d13f654b-8935-4c2b-a660-e2d04a2aaeba', '5e1cc8ef-1e16-4be6-b985-40e51fa7c085', 'ჩუროსის დასამზადებელი დანადგარი', 'and', 'churosis-dasamzadebeli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a86acd3f-cf91-4e3d-81d9-9cb355476f0b', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო მაცივარი/დახლ-მაცივარი', 'and', 'samretsvelo-matsivari-dakhl-matsivari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dd75c07c-2cd1-48ef-a014-cb65b5e67868', '82f5114a-ed08-4c27-b354-19503acfebb2', 'თეფშების საშრობი სამრეწველო  თარო', 'Tepshebis Sashrobi Samretsvelo Taro', 'tepshebis-sashrobi-samretsvelo-taro', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('059ed2a6-4275-4f30-b530-d245e58ea514', '82f5114a-ed08-4c27-b354-19503acfebb2', 'ნაგვის სამრეწველო ურნა', 'Nagvis Samretsvelo Urna', 'nagvis-samretsvelo-urna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9d3fcb73-b72f-4cda-bd3f-322163e60b39', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო ავზი', 'Samretsvelo Avzi', 'samretsvelo-avzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e5d877c8-8191-41b2-bbf9-6b61e3cbb19b', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო გამწოვი', 'Samretsvelo Gamtsovi', 'samretsvelo-gamtsovi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b93c74d3-efbf-4cd3-bd49-15ff41d5e81c', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო თარო', 'Samretsvelo Taro', 'samretsvelo-taro', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7be0800d-d33a-45af-bf20-43d906f3fe03', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო მაგიდა', 'and', 'samretsvelo-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8f4f4a1f-fbf4-4cd4-9501-59b5d2641589', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო ნიჟარა', 'Samretsvelo Nizhara', 'samretsvelo-nizhara', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('991f517b-4d70-4388-9e78-b9e2aa4d0010', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო საშრობი', 'Samretsvelo Sashrobi', 'samretsvelo-sashrobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('efe44c94-b5e3-49de-84ea-882b9d1c4b9d', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო სტელაჟი', 'Samretsvelo Stelazhi', 'samretsvelo-stelazhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f05b6706-7dba-4ff8-b2e4-b37d3c037806', '82f5114a-ed08-4c27-b354-19503acfebb2', 'სამრეწველო ურიკა', 'Samretsvelo Urika', 'samretsvelo-urika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('11e4cc50-87be-450a-bd52-d70a8ad4a5ec', '82f5114a-ed08-4c27-b354-19503acfebb2', 'საცხობი ლანგრების სამრეწველო  გორიალა', 'Satskhobi Langrebis Samretsvelo Goriala', 'satskhobi-langrebis-samretsvelo-goriala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('14ea912b-b335-4edc-8ee7-bd8a7030fb20', '82f5114a-ed08-4c27-b354-19503acfebb2', 'ჭურჭლის სარეცხი სამრეწველო მანქანა', 'Churchlis Saretskhi Samretsvelo Mankana', 'churchlis-saretskhi-samretsvelo-mankana', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bcca045d-b1aa-475b-a120-29d20e565afe', 'afad7828-bee2-4b8f-aba6-81cc783f126e', 'სამრეწველო მაყალი/გრილი', 'Samretsvelo Maqali Grili', 'samretsvelo-maqali-grili', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('334e9e57-fdea-4563-85eb-9890af95c4f1', 'afad7828-bee2-4b8f-aba6-81cc783f126e', 'სამრეწველო ქურა', 'Samretsvelo Kura', 'samretsvelo-kura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('99cc7976-c8df-444f-8835-a49e4e6342d6', 'afad7828-bee2-4b8f-aba6-81cc783f126e', 'სამრეწველო შესაბოლი დანადგარი', 'and', 'samretsvelo-shesaboli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('69429ea4-e56c-4ce4-8aad-d85a1fe21897', 'afad7828-bee2-4b8f-aba6-81cc783f126e', 'ფრის მოსამზადებელი დანადგარი (ფრიტურნიცა)', 'and', 'pris-mosamzadebeli-danadgari-priturnitsa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9b879482-0074-4944-b36c-70d23da8d99b', 'afad7828-bee2-4b8f-aba6-81cc783f126e', 'შაურმის დანადგარი', 'and', 'shaurmis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f399f181-5bb4-4b31-a49b-c76dba0b8e75', 'afad7828-bee2-4b8f-aba6-81cc783f126e', 'ჩებურეკის დასამზადებელი დანადგარი', 'and', 'cheburekis-dasamzadebeli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c8045745-5e77-4d25-ba2a-7d91ccc3b772', 'afad7828-bee2-4b8f-aba6-81cc783f126e', 'ჰოთ-დოგის დანადგარი', 'and', 'hot-dogis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f57bbe32-7761-456f-bf65-2bf9a9e95f25', '4943131b-53d5-429d-9b3d-79d03c505a8e', 'ბრინჯის მოსახარში სამრეწველო დანადგარი', 'and', 'brinjis-mosakharshi-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5d0a8134-241c-47b9-9612-98dc51891c3d', '4943131b-53d5-429d-9b3d-79d03c505a8e', 'კვერცხის მოსახარში სამრეწველო დანადგარი', 'and', 'kvertskhis-mosakharshi-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f820e82e-8d20-4064-9011-c606bcd753fb', '4943131b-53d5-429d-9b3d-79d03c505a8e', 'პასტის მოსამზადებელი სამრეწველო დანადგარი', 'and', 'pastis-mosamzadebeli-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e1065811-f35b-42ba-b8cc-3e5a90e846b4', '4943131b-53d5-429d-9b3d-79d03c505a8e', 'სოსისის მოსახარში სამრეწველო დანადგარი', 'and', 'sosisis-mosakharshi-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3289b214-7236-4c8d-82cf-7f2cc3a968ce', '4943131b-53d5-429d-9b3d-79d03c505a8e', 'სუვიდის სამრეწველო დანადგარი', 'and', 'suvidis-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('95ce7e75-b5c6-4613-b338-85e9c512802e', '4943131b-53d5-429d-9b3d-79d03c505a8e', 'ხინკლის სამრეწველო ქვაბი', 'Khinklis Samretsvelo Kvabi', 'khinklis-samretsvelo-kvabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e7fbfce1-2265-49f8-b177-af34fb35b2dc', '5b3647e9-81d6-4efb-9f3d-06a5f642d5ad', 'ბოსტნეულის სამრეწველო საჭრელი', 'Bostneulis Samretsvelo Sachreli', 'bostneulis-samretsvelo-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('26c15b98-3f50-4c58-9d51-1cba68f752cc', '5b3647e9-81d6-4efb-9f3d-06a5f642d5ad', 'პურის სამრეწველო საჭრელი', 'Puris Samretsvelo Sachreli', 'puris-samretsvelo-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('883af9e5-2762-402f-917c-0c99cc415312', '5b3647e9-81d6-4efb-9f3d-06a5f642d5ad', 'სამრეწველო სლაისერი', 'Samretsvelo Slaiseri', 'samretsvelo-slaiseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('849d5799-1c3b-4218-a7e4-3206fc47d8dd', '5b3647e9-81d6-4efb-9f3d-06a5f642d5ad', 'ფრის სამრეწველო საჭრელი', 'Pris Samretsvelo Sachreli', 'pris-samretsvelo-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e6d0848b-3895-4360-ac13-f2efb5ee1280', '5b3647e9-81d6-4efb-9f3d-06a5f642d5ad', 'ძვლის სახერხი სამრეწველო დანადგარი', 'and', 'dzvlis-sakherkhi-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6d9db33-c6a8-4a1b-af0d-915ac98a6469', '5b3647e9-81d6-4efb-9f3d-06a5f642d5ad', 'ხილის სამრეწველო საჭრელი', 'Khilis Samretsvelo Sachreli', 'khilis-samretsvelo-sachreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c397b58b-2aaf-47f4-8dac-507331b7ea8a', 'bf7c22df-a8a4-4b3b-8f3a-bedc419353b8', 'სამრეწველო საფრცქვნელი დანადგარი', 'and', 'samretsvelo-saprtskvneli-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea93ff05-965b-419e-b800-de31fd8500e3', 'bf7c22df-a8a4-4b3b-8f3a-bedc419353b8', 'ხილის/ბოსტნეულის სამრეწველო სარჩევი', 'Khilis Bostneulis Samretsvelo Sarchevi', 'khilis-bostneulis-samretsvelo-sarchevi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('93a43658-d696-4f7f-8465-2c9ace7649ba', '04e1b8d8-48e6-4b14-97c9-45b59482c938', 'სამრეწველო წვენსაწური', 'Samretsvelo Tsvensatsuri', 'samretsvelo-tsvensatsuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0ca11206-0075-4307-be66-db4b89433235', '04e1b8d8-48e6-4b14-97c9-45b59482c938', 'სოკოს წარმოების დანადგარი', 'and', 'sokos-tsarmoebis-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2467fdb1-45b9-431d-9868-4404e7273e7b', '04e1b8d8-48e6-4b14-97c9-45b59482c938', 'ტომატის დასამზადებელი სამრეწველო დანადგარი', 'and', 'tomatis-dasamzadebeli-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('466a36e1-9a63-4df8-9d50-5b7fc998492c', '04e1b8d8-48e6-4b14-97c9-45b59482c938', 'ხილის და ბოსტნეულის სარეცხი სამრეწველო დანადგარი', 'and', 'khilis-da-bostneulis-saretskhi-samretsvelo-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a40b7e08-1637-418d-bd30-a4139d7da1f2', '29de71f4-0732-4bf8-a3cf-7b945b027394', 'სამრეწველო შაქრის პუდრის საფქვავი', 'Samretsvelo Shakris Pudris Sapkvavi', 'samretsvelo-shakris-pudris-sapkvavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('83e337b8-a5f2-4d3d-a6f9-3069a4bce47e', '29de71f4-0732-4bf8-a3cf-7b945b027394', 'საფანელის/სუხარის სამრეწველო საფქვავი', 'Sapanelis Sukharis Samretsvelo Sapkvavi', 'sapanelis-sukharis-samretsvelo-sapkvavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('227dc49f-c52d-4fdf-9598-a7bbd265ada4', '29de71f4-0732-4bf8-a3cf-7b945b027394', 'ყავის სამრეწველო საფქვავი', 'Qavis Samretsvelo Sapkvavi', 'qavis-samretsvelo-sapkvavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('234c3f91-11c5-4228-96e8-25af7044977b', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'ბოტასი', 'Botasi', 'botasi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e471baf8-085c-432d-82ec-919d5dbda610', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'ესპადრელი', 'Espadreli', 'espadreli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dba196dd-82dd-4f29-8987-96e8200dcdaf', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'კედი', 'Kedi', 'kedi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1234abee-932c-49cc-8a5f-70d56e5d6f64', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'კლასიკური ფეხსაცმელი', 'Footwear', 'klasikuri-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('628c9b85-2333-45e3-b44b-acf4ad0abb1e', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'სანდალი', 'and', 'sandali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b4dd77f4-6727-4a14-932e-8213038af620', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'ქოში', 'Koshi', 'koshi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('30a0ad04-1a22-4c4f-8845-fc4ca2825b87', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'შუზი', 'Shuzi', 'shuzi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eff099db-4804-43dc-b253-3e9b0d5bcad8', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'ჩექმა', 'Chekma', 'chekma', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('43f41c37-e81d-4772-9a2f-bccd1d0bcd76', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'ჩუსტი', 'Chusti', 'chusti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('663ea67f-9ac5-44e3-8514-ab45745ff0ad', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'ჰუგი', 'Hugi', 'hugi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3460b38b-4889-4f37-938b-01f5f7944a2d', '18f2243d-3c48-4ac5-a68e-c80e381eff5e', 'სპეც.ფეხსაცმელი', 'Footwear', 'spets-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80d626b9-5824-43c3-8431-4adea845a04d', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'კრივის ფეხსაცმელი', 'Footwear', 'krivis-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e7cd3772-f92c-4b7e-8dfd-02e52e7b9e70', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'სამხედრო/ტაქტიკური ფეხსაცმელი', 'Footwear', 'samkhedro-taktikuri-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ac5d9e4-2143-4368-9e0d-3749c87e1856', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'ბალაკლავა', 'Balaklava', 'balaklava', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0ad43325-0143-42b1-a381-7475ee42b3ef', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'თმის სამაგრი', 'Tmis Samagri', 'tmis-samagri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02f41b5b-8528-4809-963f-07006ad93444', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'კლასიკური ხელთათმანი', 'Klasikuri Kheltatmani', 'klasikuri-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6c390d9a-e2f2-420a-a21d-d38a654da616', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'მარაო', 'Marao', 'marao', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c0974ab-e28f-4a39-9d68-b99cc733c061', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'საფულე', 'Sapule', 'sapule', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('25c553d7-bb77-4441-be47-04dfdb8470a3', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'ქამარი', 'Kamari', 'kamari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('464737dc-1ec2-42ba-8b9d-e4f63579eb37', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'ქოლგა', 'Kolga', 'kolga', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('05e95f54-cc61-4017-9363-518afcc9953b', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'ქუდი', 'Kudi', 'kudi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d055764c-2806-45cc-8590-115fa7e14555', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'შარფი', 'Sharpi', 'sharpi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('649a83a2-ec9b-4239-8385-c6bef8c3cdcf', 'b771e7a9-7d93-4ee7-a504-bd866dda52be', 'ჰალსტუხი', 'Halstukhi', 'halstukhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('612cc47d-85c4-4171-b34e-1d0f43190b9d', '729e11ed-083a-40ca-956d-a05c588f8fcd', 'კლასიკური ზურგჩანთა', 'Klasikuri Zurgchanta', 'klasikuri-zurgchanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0dd9cac8-ea16-49a4-bb97-ecd83d88bf0c', '729e11ed-083a-40ca-956d-a05c588f8fcd', 'მხრის ჩანთა', 'Mkhris Chanta', 'mkhris-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c05db704-528f-4779-a332-8566950c51c1', '729e11ed-083a-40ca-956d-a05c588f8fcd', 'ქლაჩი', 'Klachi', 'klachi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b1d0c003-4755-4224-a015-e8935c9d2b46', '729e11ed-083a-40ca-956d-a05c588f8fcd', 'წელის ჩანთა', 'Tselis Chanta', 'tselis-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('074be581-1d62-4a6d-9960-e378178fafb9', '729e11ed-083a-40ca-956d-a05c588f8fcd', 'ხელჩანთა', 'Khelchanta', 'khelchanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('265755c9-ea05-4536-b9e9-cdd6359197c7', '34db3034-1581-4fed-acf6-826d4465f20c', 'დამატებითი ჩანთა', 'and', 'damatebiti-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a31afbb8-0a4f-435c-91b3-b3514262265b', '34db3034-1581-4fed-acf6-826d4465f20c', 'სალაშქრო ზურგჩანთა', 'Salashkro Zurgchanta', 'salashkro-zurgchanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b63600b5-1816-4a39-a3e5-8140137020e3', '34db3034-1581-4fed-acf6-826d4465f20c', 'სპორტული ინვენტარის ჩანთა', 'Sportuli Inventaris Chanta', 'sportuli-inventaris-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9d264983-3b0f-4510-84c3-b6c7d90e18ed', '34db3034-1581-4fed-acf6-826d4465f20c', 'ჩემოდანი', 'and', 'chemodani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('34fcffa5-d61b-4a91-96ca-5cbf1c4c8685', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'პადელი', 'Padeli', 'padeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3a76a70c-30b4-4996-819e-077af967bfe3', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ტატამი', 'Tatami', 'tatami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1422d8ec-dc5c-444c-ab65-573c042afe42', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ფარიკაობა', 'Parikaoba', 'parikaoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0cb57d23-e040-43dc-bcde-bddfa17c8801', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ჰოკეი', 'Hokei', 'hokei', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b0e90181-8aa5-416e-9b53-f24971d762ed', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ფეხბურთი', 'Pekhburti', 'pekhburti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04402530-6b3f-4fcf-bb77-6cf4c61317bb', 'f2411d2d-4f6a-4be4-a933-464369e97d3c', 'ჭადრაკის დაფა', 'and', 'chadrakis-dapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('312eb5a9-2e94-493e-b0f0-ecfa27838977', 'f2411d2d-4f6a-4be4-a933-464369e97d3c', 'ჭადრაკის საათი', 'Watch', 'chadrakis-saati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c7d09ffa-2a3f-4f83-b771-5b1967e48caf', 'f2411d2d-4f6a-4be4-a933-464369e97d3c', 'ჭადრაკის ფიგურები', 'Chadrakis Pigurebi', 'chadrakis-pigurebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('62e29e30-3993-412d-8669-ac09ef2afe4a', 'c878c0d1-99eb-464e-9561-1774292e526c', 'თეკვონდოს ხელთათმანი', 'Tekvondos Kheltatmani', 'tekvondos-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('368c4a97-09fa-4463-aa91-55a3d621dc98', '894b1ed0-f283-4a58-a98a-d0bf7ca16ccf', 'ჩოგბურთის ბადე', 'Chogburtis Bade', 'chogburtis-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eb31bbfb-fb26-479b-9ab3-a23f2d12772b', '894b1ed0-f283-4a58-a98a-d0bf7ca16ccf', 'ჩოგბურთის ბურთი', 'Chogburtis Burti', 'chogburtis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c8ff18b-9f44-4605-bbd2-dc3194860675', '894b1ed0-f283-4a58-a98a-d0bf7ca16ccf', 'ჩოგბურთის ჩოგანი', 'Chogburtis Chogani', 'chogburtis-chogani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d8cfbbdf-9204-421b-be24-0f50f705ef6f', '149b88f0-f657-4ee1-890d-3bb82a31a398', 'პინგ-პონგის ბადე', 'Ping Pongis Bade', 'ping-pongis-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ee955cb-5644-479f-80d5-3a4bab5d3738', '149b88f0-f657-4ee1-890d-3bb82a31a398', 'პინგ-პონგის ბურთი', 'Ping Pongis Burti', 'ping-pongis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('64647693-1702-4c53-9746-0c120637008b', '149b88f0-f657-4ee1-890d-3bb82a31a398', 'პინგ-პონგის მაგიდა', 'and', 'ping-pongis-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6b197c5c-f94a-424b-9d4d-03599faa2190', '149b88f0-f657-4ee1-890d-3bb82a31a398', 'პინგ-პონგის ჩოგანი', 'Ping Pongis Chogani', 'ping-pongis-chogani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2fa428c8-9371-43fe-8dc4-8caa2ae08c9b', 'c3f824b6-69d8-479c-a636-4a8c0b23f6d8', 'კრივის ბალიშები', 'Krivis Balishebi', 'krivis-balishebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e6fdba3e-f078-41cb-98c9-f02a354f91c1', 'c3f824b6-69d8-479c-a636-4a8c0b23f6d8', 'კრივის ბურთი', 'Krivis Burti', 'krivis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('72b7d37f-f9a2-469a-8f2c-4c43f07a2626', 'c3f824b6-69d8-479c-a636-4a8c0b23f6d8', 'კრივის რინგი', 'Krivis Ringi', 'krivis-ringi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f156715a-f15e-44a7-9964-7a8fdb0a58b4', 'c3f824b6-69d8-479c-a636-4a8c0b23f6d8', 'კრივის ჩაფხუტი', 'Krivis Chapkhuti', 'krivis-chapkhuti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('58ca105e-c585-4901-8cac-0e300170f8ef', 'c3f824b6-69d8-479c-a636-4a8c0b23f6d8', 'კრივის ხელთათმანი', 'Krivis Kheltatmani', 'krivis-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c6e0b6f5-00b7-4c2c-a3ce-6f9d8566ac5e', '941b0a36-0837-4c92-a122-982fe35cbdb3', 'ბადმინტონის ბადე', 'Badmintonis Bade', 'badmintonis-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('db989b5f-5ca4-4473-bc0b-cb70a299f626', '941b0a36-0837-4c92-a122-982fe35cbdb3', 'ბადმინტონის ვოლანი', 'Badmintonis Volani', 'badmintonis-volani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37df97c5-2a7d-4971-a604-014e0629c465', '941b0a36-0837-4c92-a122-982fe35cbdb3', 'ბადმინტონის ჩოგანი', 'Badmintonis Chogani', 'badmintonis-chogani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e391ef77-c400-4bd3-b687-78f4789c1094', '1525bb6f-151d-4b00-8eab-1987599870fd', 'აერობიკის სტეპი', 'Aerobikis Stepi', 'aerobikis-stepi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aa13ac47-9d82-4591-bed0-dbfaf970599d', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ბალანსის ბურთი', 'Balansis Burti', 'balansis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c95e2b1e-1105-428a-9569-ecdea886c431', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ბალანსის დაფა', 'and', 'balansis-dapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6badb7e-47e5-47fe-885c-6555f17c42ae', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ბატუტი', 'Batuti', 'batuti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b42c3839-74c3-46f7-9b63-b2ce569a0f54', '1525bb6f-151d-4b00-8eab-1987599870fd', 'იოგას კუბი', 'Iogas Kubi', 'iogas-kubi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d1ad672b-4a6f-47c8-920e-4d8cbe53a2da', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ლახტი', 'Lakhti', 'lakhti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ed873943-148f-4b3d-9070-98ad8f3480b3', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ფიტნეს ბურთი', 'Pitnes Burti', 'pitnes-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('41dfcea3-dbd5-48b5-b2fb-6bcfefeae629', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ფიტნეს დისკი', 'Pitnes Diski', 'pitnes-diski', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6cb2e3d0-fefe-4f06-9522-5081bf43ea21', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ფიტნეს ფირფიტა', 'Pitnes Pirpita', 'pitnes-pirpita', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('930634ff-7fba-4870-ad37-dc907620a132', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ფიტნეს ხელთათმანი', 'Pitnes Kheltatmani', 'pitnes-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cbb07b23-70fa-4528-9946-2f774c14f218', '1525bb6f-151d-4b00-8eab-1987599870fd', 'ქვეშაგები (პარალონი)', 'Kveshagebi Paraloni', 'kveshagebi-paraloni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1d6bf373-496a-4d57-b6a0-fc41160dc495', '41aa9cd1-df60-4210-a543-4aa4bc7008f4', 'ბეისბოლის ბურთი', 'Beisbolis Burti', 'beisbolis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb57803c-2bfa-455e-925b-003c47e3ddd7', '41aa9cd1-df60-4210-a543-4aa4bc7008f4', 'ბეისბოლის ხელთათმანი', 'Beisbolis Kheltatmani', 'beisbolis-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('628c27be-1e8d-46e3-8efd-76c917a4fcaa', '41aa9cd1-df60-4210-a543-4aa4bc7008f4', 'ბეისბოლის ჯოხი', 'Beisbolis Jokhi', 'beisbolis-jokhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fd5961f0-0163-4cd7-b6bb-dc5e685da1d7', '2275ea55-3579-4540-ac02-d7362d222464', 'კარატეს ხელთათმანი', 'Karates Kheltatmani', 'karates-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('68cc9eeb-1b08-421f-a53e-758defa3e800', '2275ea55-3579-4540-ac02-d7362d222464', 'ნუნჩაკუ', 'Nunchaku', 'nunchaku', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8233e819-fb33-4dda-a0ac-4bf15bc6d2a0', '031c8c6d-2ac0-48bd-a138-364602cfc5d4', 'მძლეოსნობის ქამარი', 'Mdzleosnobis Kamari', 'mdzleosnobis-kamari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('15dff9d7-92b9-4e02-a5ee-6f58c266fb64', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის ბურთი', 'Biliardis Burti', 'biliardis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8075960d-b812-40cd-94c2-1072675d2ef6', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის დამხმარე ჯოხი', 'and', 'biliardis-damkhmare-jokhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('765a7356-4ec8-45f7-a667-60b3546dde51', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის დამხმარე ჯოხის თავი', 'and', 'biliardis-damkhmare-jokhis-tavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('85879d2e-11fb-40da-8568-dfd350c2f668', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის კიი', 'Biliardis Kii', 'biliardis-kii', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e86394ad-f4db-4365-8304-64b671c3943b', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის კიის თავი', 'Biliardis Kiis Tavi', 'biliardis-kiis-tavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f1630478-6ae0-4c6b-8349-95bdff175218', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის კიის თარო', 'Biliardis Kiis Taro', 'biliardis-kiis-taro', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b173994e-b965-4558-bc23-0d6f238cab69', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის კიის საკიდი', 'Biliardis Kiis Sakidi', 'biliardis-kiis-sakidi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c0756f7c-87ec-411a-a26b-caac84c3f0fc', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის კიის ჩასადები', 'Biliardis Kiis Chasadebi', 'biliardis-kiis-chasadebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b0d800d3-a6ec-476c-9e13-0fd0258730ac', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის კიის ცარცი', 'Biliardis Kiis Tsartsi', 'biliardis-kiis-tsartsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b7f56211-2d38-4390-b329-cc0343331c78', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის მაგიდა', 'and', 'biliardis-magida', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0bb26c93-5a00-4cf0-a86b-4c1fbe4a251a', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის სამკუთხედი', 'Biliardis Samkutkhedi', 'biliardis-samkutkhedi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b81a5079-7d1d-48e7-ace4-2e4793164931', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის ხელთათმანი', 'Biliardis Kheltatmani', 'biliardis-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e7951e19-bba6-45ab-845b-8d9c4aff2370', '56e52846-c744-4dcb-a286-cffa419b2953', 'ბილიარდის მაგიდის აქსესუარები', 'Biliardis Magidis Aksesuarebi', 'biliardis-magidis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f010d9c3-6076-4682-bfc6-73060bd52ab9', '9f3992aa-de22-4728-a579-2a61422fca88', 'გოლფის ბურთი', 'Golpis Burti', 'golpis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5fb9e348-ace1-4344-a754-9268360aa3b0', '9f3992aa-de22-4728-a579-2a61422fca88', 'გოლფის ჭოგრიტი', 'Golpis Chogriti', 'golpis-chogriti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4b51448b-578d-465e-9fed-abee3b3f0e93', '9f3992aa-de22-4728-a579-2a61422fca88', 'გოლფის ჯოხი', 'Golpis Jokhi', 'golpis-jokhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('181369b6-7be9-433d-ade3-899a3cb213ab', 'b0e90181-8aa5-416e-9b53-f24971d762ed', 'მეკარის ხელთათმანი', 'Mekaris Kheltatmani', 'mekaris-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5c2c7e5f-3b38-4b6d-ab6a-1e3895b88442', 'b0e90181-8aa5-416e-9b53-f24971d762ed', 'საფეხბურთო კარი', 'Sapekhburto Kari', 'sapekhburto-kari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b9a054d5-451e-4362-9fa0-5c377f26b6a8', 'b0e90181-8aa5-416e-9b53-f24971d762ed', 'საფეხბურთო კარის ბადე', 'Sapekhburto Karis Bade', 'sapekhburto-karis-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6746f9fa-9b38-40c3-a0e1-ace180da9b6e', 'b0e90181-8aa5-416e-9b53-f24971d762ed', 'ფეხბურთის ბურთი', 'Pekhburtis Burti', 'pekhburtis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9672bb56-a256-4b77-bbc7-7bcb08a3c4ea', '9ee15e58-6007-4145-90f3-29ae8f3c0487', 'ფრენბურთის ბადე', 'Prenburtis Bade', 'prenburtis-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37d10a0c-dd3e-4ab2-8e02-0ee1b3ccd0f7', '9ee15e58-6007-4145-90f3-29ae8f3c0487', 'ფრენბურთის ბურთი', 'Prenburtis Burti', 'prenburtis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b7ada2f9-98b2-4116-b07b-167de3f83b99', '21c20e5d-4575-4e44-9c02-f511f213101a', 'კალათბურთის ბურთი', 'Kalatburtis Burti', 'kalatburtis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e5ceb653-20d3-4ab4-ada9-08e97c259637', '21c20e5d-4575-4e44-9c02-f511f213101a', 'კალათბურთის ფარი', 'Kalatburtis Pari', 'kalatburtis-pari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c7825d3-d33a-401b-8898-ef9e1fcf7c90', '21c20e5d-4575-4e44-9c02-f511f213101a', 'კალათბურთის ფარის ბადე', 'Kalatburtis Paris Bade', 'kalatburtis-paris-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8517a4ca-e5eb-42c5-a9ac-13d3a1a0923c', '9613af06-3681-47a9-9043-b17c72cb882a', 'რაგბის ბურთი', 'Ragbis Burti', 'ragbis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6624350d-f6a4-4f2c-9482-c2902dbe742a', '53740690-5886-4d0a-a6e9-c30345798b9e', 'ხელბურთის ბურთი', 'Khelburtis Burti', 'khelburtis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e769ab36-312c-4abd-b38e-c1a3bde937ac', '00f17e55-f17c-4268-97e0-f96ce2cd7f6c', 'წყალბურთის ბურთი', 'Tsqalburtis Burti', 'tsqalburtis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a03b12ba-efc6-4d5f-9730-7e8c8da86f6a', '0559ec55-6639-47de-87fb-f37a6cfb8b36', 'ბოულინგის ბურთი', 'Boulingis Burti', 'boulingis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('91ea602c-1bfb-4c34-83d8-2c0961e5287e', 'f9b63640-761e-43b6-a865-c3802e5a7367', 'ტანვარჯიშის ბურთი', 'Tanvarjishis Burti', 'tanvarjishis-burti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9e3f2bfb-0b3f-4026-a9c8-e7f6b77ab8fa', 'feed3700-d1ed-4d06-8d77-d3d944d30ef2', 'დარტსის დაფა', 'and', 'dartsis-dapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('594ed9b5-0f36-4e9a-b35d-560957635163', 'feed3700-d1ed-4d06-8d77-d3d944d30ef2', 'დარტსის ისრები', 'and', 'dartsis-isrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0518733c-d015-43b3-a21a-dda9e9b3acaf', '236790b1-005b-4d94-9936-b30c82da69b2', 'ელასტიური სახვევი', 'Elastiuri Sakhvevi', 'elastiuri-sakhvevi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d8dc18ae-79b2-417d-a915-01744cae0f98', '236790b1-005b-4d94-9936-b30c82da69b2', 'კაპა', 'Kapa', 'kapa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5d6545d1-3d9b-4e41-a152-e9c1fd857e75', '236790b1-005b-4d94-9936-b30c82da69b2', 'კინეზიოლოგიური ლენტი ', 'Kineziologiuri Lenti', 'kineziologiuri-lenti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ff03b27d-f937-4d54-9caa-2ed0a48d511c', '236790b1-005b-4d94-9936-b30c82da69b2', 'საიდაყვე', 'and', 'saidaqve', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aa68f854-6a67-44e7-994a-8826b0a98fd8', '236790b1-005b-4d94-9936-b30c82da69b2', 'სამკერდე/საზურგე', 'Samkerde Sazurge', 'samkerde-sazurge', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('553ef88c-70f5-4b3d-a775-93c22e4b7532', '236790b1-005b-4d94-9936-b30c82da69b2', 'სამუხლე/საწვივე', 'Samukhle Satsvive', 'samukhle-satsvive', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6bd58974-36f2-4b9c-86cc-d58f7d09e245', '236790b1-005b-4d94-9936-b30c82da69b2', 'სპორტული ჩაფხუტი', 'Sportuli Chapkhuti', 'sportuli-chapkhuti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e177352-996b-4a35-b304-cc36b5269c15', '6959409c-3e23-4910-b5e4-b7dc22087ac0', 'თასი', 'Tasi', 'tasi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('74e28f3d-aa0a-415c-9faa-33776e316b6f', '6959409c-3e23-4910-b5e4-b7dc22087ac0', 'მედალი', 'and', 'medali', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c6b9b3ac-f18a-46cf-8e08-acad841a6b6e', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'თხილამური', 'Tkhilamuri', 'tkhilamuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cc20cc14-176c-4d15-8f8f-25b61f0dbe40', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სათხილამურო საბარგული', 'Satkhilamuro Sabarguli', 'satkhilamuro-sabarguli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dcb04f3e-17f1-4f6c-b2bc-eb9626a5a990', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სათხილამურო სათვალე', 'Satkhilamuro Satvale', 'satkhilamuro-satvale', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('893723c1-fc21-4937-add8-6c38ab5b383a', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სათხილამურო ფეხსაცმელი', 'Footwear', 'satkhilamuro-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b25daf02-c0b9-48c7-b8c2-4521761eb49e', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სათხილამურო ჩაფხუტი', 'Satkhilamuro Chapkhuti', 'satkhilamuro-chapkhuti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e656bd06-1a15-40a5-b985-307674adf45a', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სათხილამურო ხელთათმანი', 'Satkhilamuro Kheltatmani', 'satkhilamuro-kheltatmani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aad1da2b-ef2c-4b9b-93e7-6f0a576a897c', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სათხილამურო ჯოხები', 'Satkhilamuro Jokhebi', 'satkhilamuro-jokhebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2583e923-5723-4eba-b3a1-8d25ba213231', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სნოუბორდი', 'Snoubordi', 'snoubordi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('eae53b91-e113-4754-a0f3-2ff66cfeac38', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'სნოუბორდის ფეხსაცმელი', 'Footwear', 'snoubordis-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e33a82b6-ca07-4bbf-a7e5-3280efa60bd0', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'ციგა', 'Tsiga', 'tsiga', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ed73ea3f-5ed9-4c24-941c-f46980a7470f', '3c0350a2-ad91-4726-97e3-04d6267942f0', 'ციგურები', 'Tsigurebi', 'tsigurebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('26de6f3e-24ac-4082-b5fe-ee5152f99166', 'e7951e19-bba6-45ab-845b-8d9c4aff2370', 'ბილიარდის ლუზა', 'Biliardis Luza', 'biliardis-luza', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8815075d-0f1f-4f44-9e83-167d710f24b3', 'e7951e19-bba6-45ab-845b-8d9c4aff2370', 'ბილიარდის მაგიდის ბადე', 'Biliardis Magidis Bade', 'biliardis-magidis-bade', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f4df7294-4dbe-4004-b2ab-920c2b352399', 'e7951e19-bba6-45ab-845b-8d9c4aff2370', 'ბილიარდის მაგიდის გადასაფარებელი', 'and', 'biliardis-magidis-gadasaparebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('43a413d1-eff6-49a7-83a3-c01a372511e9', 'e7951e19-bba6-45ab-845b-8d9c4aff2370', 'ბილიარდის მაგიდის განათება', 'Biliardis Magidis Ganateba', 'biliardis-magidis-ganateba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('de785cde-3079-4ec7-9a21-4b2e1ffa6aa1', 'e7951e19-bba6-45ab-845b-8d9c4aff2370', 'ბილიარდის მაუდი', 'Biliardis Maudi', 'biliardis-maudi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3ce6d344-051d-47c2-ac8c-4c88e648db3c', 'cf629a21-15b2-4b8f-95b9-f5bc3573fcbe', 'რაცია', 'Ratsia', 'ratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea953f08-f034-4e3a-87b9-28a59a503020', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'BB კრემი', 'BB Kremi', 'bb-kremi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4da30669-3672-4434-80d0-7ba189b81b10', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ავტორუჯი', 'Avtoruji', 'avtoruji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f3289b78-9acd-47f4-b810-ad305b99ac65', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'აცეტონი', 'Atsetoni', 'atsetoni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9e542c93-ac5a-43c2-a62a-4beb192825d5', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ბლაში', 'Blashi', 'blashi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('19906f8d-bb5a-42a4-9b58-e535601355e5', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'თვალის ფანქარი', 'Tvalis Pankari', 'tvalis-pankari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('97f6f708-47b3-48d5-a0b7-943e1339340d', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'თვალის ჩრდილი', 'Tvalis Chrdili', 'tvalis-chrdili', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b4f6a397-0288-49ba-b180-0fb2c8708d95', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ლაინერი', 'Laineri', 'laineri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('749d7d26-e433-483e-a70a-dcc0a1528386', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'პალიტრები', 'Palitrebi', 'palitrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('46c60019-62b1-4ce9-9501-87fab8857128', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'პრაიმერი', 'Praimeri', 'praimeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f810f0b6-1a6b-4629-9f2a-b63fc4ad2670', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'პუდრი', 'Pudri', 'pudri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2984b8a1-e164-478c-92cf-ea8a5f5ea956', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'რუჟი', 'Ruzhi', 'ruzhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e47da301-5093-4888-a0bc-f127548d5d2c', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ტონალური კრემი', 'Tonaluri Kremi', 'tonaluri-kremi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e602a56-367f-4ce6-a383-953848884c74', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ტუჩის გლოსი', 'Tuchis Glosi', 'tuchis-glosi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('06bdbd12-e046-47a8-add9-0de66bd308f3', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ტუჩის ფანქარი', 'Tuchis Pankari', 'tuchis-pankari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c0b5d5bb-d5e1-41e6-a8da-c6805650e630', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ტუჩსაცხი', 'Tuchsatskhi', 'tuchsatskhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a7d84b45-d2cc-4fbe-9bc2-10c7d762d927', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ფრჩხილის ლაქი', 'Prchkhilis Laki', 'prchkhilis-laki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c87cfd1a-f3ad-4652-92c5-ae2ea485cee7', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'ქონსილერი', 'Konsileri', 'konsileri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f79476af-5b11-446d-a5e6-406525db5f55', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'შიმერი', 'Shimeri', 'shimeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a07be2d0-7f94-45b9-b42a-5f916c3cc7ba', 'dfe9a1ea-8c62-40fb-a28d-4cf14362cd3b', 'კოსმეტიკის აქსესუარები', 'Kosmetikis Aksesuarebi', 'kosmetikis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('257b6c75-6cac-4a28-8c42-7b5be3d1e215', 'a07be2d0-7f94-45b9-b42a-5f916c3cc7ba', 'კოსმეტიკის ორგანაიზერი', 'Kosmetikis Organaizeri', 'kosmetikis-organaizeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cdc5de82-8d46-4be9-a80c-1f208c976530', 'a07be2d0-7f94-45b9-b42a-5f916c3cc7ba', 'კოსმეტიკის ფუნჯი', 'Kosmetikis Punji', 'kosmetikis-punji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7ffc9166-4ec6-48bd-a1eb-3fad01acc46d', 'a07be2d0-7f94-45b9-b42a-5f916c3cc7ba', 'კოსმეტიკის ჩანთა/ჩემოდანი', 'and', 'kosmetikis-chanta-chemodani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2333311f-6b2e-4d07-b72b-5c7c57eeb6c5', 'a07be2d0-7f94-45b9-b42a-5f916c3cc7ba', 'მაკიაჟის გასაკეთებელი სარკე', 'Makiazhis Gasaketebeli Sarke', 'makiazhis-gasaketebeli-sarke', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cb2caece-92d0-43c2-b1ef-9aa9e0c6e60a', 'a07be2d0-7f94-45b9-b42a-5f916c3cc7ba', 'სპონჟი', 'Sponzhi', 'sponzhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8837f43d-9a69-4bf9-9026-b7ab671f307c', 'a07be2d0-7f94-45b9-b42a-5f916c3cc7ba', 'წამწამების ასაპრეხი', 'Tsamtsamebis Asaprekhi', 'tsamtsamebis-asaprekhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2bf99870-c34b-4ef8-8060-2f13359e9f6d', '5023bf86-b53e-4f19-a9ed-db91a31771a4', 'აუდიო ვიდეო მასალის დამუშავება', 'and', 'audio-video-masalis-damushaveba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fc16f13f-d85f-4fff-b5b9-d7c832b38cb1', '5023bf86-b53e-4f19-a9ed-db91a31771a4', 'ფოტო-ვიდეო გადაღების მომსახურება', 'Services', 'poto-video-gadaghebis-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8ea89b7e-2c39-4064-9482-1820e951883c', '7f2a853e-dfa3-4c2a-8f0e-657d91bee6c7', 'აკინძვა', 'Akindzva', 'akindzva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('87116f33-d7ec-46bf-8151-de60ab77aa89', '7f2a853e-dfa3-4c2a-8f0e-657d91bee6c7', 'ბეჭდვა', 'Bechdva', 'bechdva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0c0a92f6-3c96-42ba-8abe-34117f51e4cb', '7f2a853e-dfa3-4c2a-8f0e-657d91bee6c7', 'ლამინირება', 'Laminireba', 'laminireba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f51a463d-9159-4361-badb-4f48a3802d0e', '559cbe73-b766-46ee-a0a4-22b0eb2a87c9', 'ბრენდირებული აქსესუარების დამზადება', 'and', 'brendirebuli-aksesuarebis-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bff1d055-9444-4f6f-a774-d148439c1166', '559cbe73-b766-46ee-a0a4-22b0eb2a87c9', 'სარეკლამო ბანერების დამზადება', 'and', 'sareklamo-banerebis-damzadeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('07255f72-601c-4f0e-b847-9a7468b77759', '559cbe73-b766-46ee-a0a4-22b0eb2a87c9', 'სოც.მედია მარკეტინგის მომსახურება', 'Services', 'sots-media-marketingis-momsakhureba', '🛎️', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('73adefdd-0ee4-4319-9452-eda910f20b9c', '559cbe73-b766-46ee-a0a4-22b0eb2a87c9', 'ციფრული მარკეტინგი', 'Tsipruli Marketingi', 'tsipruli-marketingi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5f76f7cd-2beb-4303-ac9c-d8b1bd8188ff', '6353c543-4fca-4d62-80b2-aade9017578b', 'ანდროიდ ტელევიზიის/SMART TV-ის სერვისები', 'Android Televiziis SMART TV Is Servisebi', 'android-televiziis-smart-tv-is-servisebi', '🎨', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('751e759d-050b-4277-a331-e66e5dd497df', '6353c543-4fca-4d62-80b2-aade9017578b', 'გაზის გამათბობელის სერვისები', 'Gazis Gamatbobelis Servisebi', 'gazis-gamatbobelis-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1b266d20-0a15-4712-883f-e3b8eda7c02c', '6353c543-4fca-4d62-80b2-aade9017578b', 'გაზქურის სერვისები', 'Gazkuris Servisebi', 'gazkuris-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8ab7624a-99fd-4387-af59-5755bacecbdf', '6353c543-4fca-4d62-80b2-aade9017578b', 'ელექტრო ღუმელის სერვისი', 'Elektro Ghumelis Servisi', 'elektro-ghumelis-servisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('edf922a0-5dd8-4bb7-a09d-e230954dd37b', '6353c543-4fca-4d62-80b2-aade9017578b', 'კონდიციონერის სერვისები ', 'Konditsioneris Servisebi', 'konditsioneris-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2f37e46d-b8ff-4330-831a-41932b153c53', '6353c543-4fca-4d62-80b2-aade9017578b', 'მაცივრის სერვისი', 'Matsivris Servisi', 'matsivris-servisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('58e5c1fa-1479-4013-86e8-c5e1fa8a0ebd', '6353c543-4fca-4d62-80b2-aade9017578b', 'მიკროტალღური ღუმელის სერვისი', 'Mikrotalghuri Ghumelis Servisi', 'mikrotalghuri-ghumelis-servisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7c87a3aa-a4f3-4f44-ac1d-7fb65c48f9a1', '6353c543-4fca-4d62-80b2-aade9017578b', 'საკაბელო/სატელიტური ტელევიზიის სერვისები', 'Sakabelo Satelituri Televiziis Servisebi', 'sakabelo-satelituri-televiziis-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cc643b86-9b08-4c9b-87ab-657b132f7ac7', '6353c543-4fca-4d62-80b2-aade9017578b', 'საოჯახო წვრილი ტექნიკის შეკეთება', 'Household', 'saojakho-tsvrili-teknikis-sheketeba', '🏠', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('767ae8ab-f842-43fb-b3a5-b80e22bd0e4c', '6353c543-4fca-4d62-80b2-aade9017578b', 'სარეცხი მანქანის სერვისები', 'Saretskhi Mankanis Servisebi', 'saretskhi-mankanis-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d0e1e49b-e6bb-4211-9bc4-7a58c38198e6', '6353c543-4fca-4d62-80b2-aade9017578b', 'ტელევიზორის სერვისები ', 'Televizoris Servisebi', 'televizoris-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('469d9313-e774-47fc-9da1-9341db04cace', '6353c543-4fca-4d62-80b2-aade9017578b', 'ცენტრალური გათბობის სერვისები', 'Tsentraluri Gatbobis Servisebi', 'tsentraluri-gatbobis-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('377468a7-eaa4-46eb-ba33-4587f340bb86', '6353c543-4fca-4d62-80b2-aade9017578b', 'წყლის გამაცხელებელის სერვისები', 'Tsqlis Gamatskhelebelis Servisebi', 'tsqlis-gamatskhelebelis-servisebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('31d25829-641b-4bae-bc2e-4a3890e62f76', '6353c543-4fca-4d62-80b2-aade9017578b', 'ჭურჭლის სარეცხი მანქანის სერვისი', 'Churchlis Saretskhi Mankanis Servisi', 'churchlis-saretskhi-mankanis-servisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4faa29d8-0383-4421-b0aa-7ec10bac85d0', '4a025c19-c49c-4f19-a72e-08141109d226', 'აბაზანის ჩუსტები', 'Abazanis Chustebi', 'abazanis-chustebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2869ba81-ea63-4917-974e-2ff70cb53dbf', '4a025c19-c49c-4f19-a72e-08141109d226', 'პირსახოცი', 'Pirsakhotsi', 'pirsakhotsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2f83b659-cdce-4837-a944-d40957b2b6ad', '4a025c19-c49c-4f19-a72e-08141109d226', 'ხალათი', 'Khalati', 'khalati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ae8d27d2-00ae-4ebb-89a5-cec708efa75a', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'საპონი', 'Saponi', 'saponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d072bfe8-7362-48c5-95df-46446851eb8a', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'აბაზანის აქსესუარების ნაკრები', 'Abazanis Aksesuarebis Nakrebi', 'abazanis-aksesuarebis-nakrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b8ff696d-dff9-42fc-917f-22e919795649', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'აბაზანის საწმენდი საშუალება', 'Abazanis Satsmendi Sashualeba', 'abazanis-satsmendi-sashualeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('079af7cd-9365-4228-871c-6f93e2fa7822', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'აბაზანის ჭიქა', 'Abazanis Chika', 'abazanis-chika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8a8d2bbb-4a34-4d45-841d-f703afd088b0', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'კბილის ჯაგრისის სათავსო', 'Kbilis Jagrisis Satavso', 'kbilis-jagrisis-satavso', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('092da48a-25ff-40d4-9db9-8edb96506f1c', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'სააბაზანო საკიდი', 'Saabazano Sakidi', 'saabazano-sakidi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d2e5a5fb-dc5e-4fbb-96e6-dcf1cb021df9', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'სასაპნე/საპნის დისპენსერი', 'Sasapne Sapnis Dispenseri', 'sasapne-sapnis-dispenseri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ab81b5b0-ae5e-4d86-ad89-51b281edce51', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'ტუალეტის ქაღალდის საკიდი', 'Tualetis Kaghaldis Sakidi', 'tualetis-kaghaldis-sakidi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a5176e7b-38bf-4d7d-8c64-ada2917a785a', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'უნიტაზის არომატიზატორი', 'Unitazis Aromatizatori', 'unitazis-aromatizatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fc7f338a-ecb9-45fd-bce6-786f2184561b', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'უნიტაზის თავსახური', 'Unitazis Tavsakhuri', 'unitazis-tavsakhuri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2204eb5a-c8ea-4edf-8452-72e4b05e5bdf', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'უნიტაზის საწმენდი სითხე', 'Unitazis Satsmendi Sitkhe', 'unitazis-satsmendi-sitkhe', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('138e1990-6004-4976-b559-0bb5607c9fb2', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'უნიტაზის ჯაგრისი', 'Unitazis Jagrisi', 'unitazis-jagrisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('076fd711-e245-49a8-9f79-c17ef702bb91', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'ხელის საშრობი', 'Khelis Sashrobi', 'khelis-sashrobi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('380f8c06-0890-47b1-bb59-6ba85f3f383e', '4fb55b19-7e21-40b4-a95d-bea9669c68cf', 'ჰიგიენური ქაღალდები', 'Higienuri Kaghaldebi', 'higienuri-kaghaldebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b5d25d0-dd3e-4ab2-acd3-091dbe6b800d', '08a140d2-c844-49f9-9dd5-58f991d84594', 'თვალების მოვლა', 'Tvalebis Movla', 'tvalebis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e1f850f-649b-464f-9d5c-5d567a42df75', '08a140d2-c844-49f9-9dd5-58f991d84594', 'თმის მოვლა', 'Tmis Movla', 'tmis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1ef3c645-2930-432f-b936-593559f13463', '08a140d2-c844-49f9-9dd5-58f991d84594', 'სახის კანის მოვლა', 'Sakhis Kanis Movla', 'sakhis-kanis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0fba08d4-c629-4062-84f3-6e7be07a3a5e', '08a140d2-c844-49f9-9dd5-58f991d84594', 'ტანის მოვლა', 'Tanis Movla', 'tanis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ed496bca-bc7f-47b0-af7d-d1330b29482e', '08a140d2-c844-49f9-9dd5-58f991d84594', 'ტუჩების მოვლა', 'Tuchebis Movla', 'tuchebis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('277e42cb-ee80-4c70-9886-3d1691edbbbf', '08a140d2-c844-49f9-9dd5-58f991d84594', 'ფრჩხილების მოვლა', 'Prchkhilebis Movla', 'prchkhilebis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('695e932e-a4e4-41b1-b2e9-659ed974829f', '08a140d2-c844-49f9-9dd5-58f991d84594', 'ბამბის დისკები', 'Bambis Diskebi', 'bambis-diskebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04c07a43-7344-4e4a-afba-4e08460200e3', '08a140d2-c844-49f9-9dd5-58f991d84594', 'როლერი/გუაშა', 'Roleri Guasha', 'roleri-guasha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3b1a1afd-1424-4d00-9af0-81bf3bb879a9', '08a140d2-c844-49f9-9dd5-58f991d84594', 'წამწამების მოვლა', 'Tsamtsamebis Movla', 'tsamtsamebis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('900cef24-c865-44e8-b122-fbb3b02fcd95', '08a140d2-c844-49f9-9dd5-58f991d84594', 'წარბების მოვლა', 'Tsarbebis Movla', 'tsarbebis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac671d5e-67db-4d31-9093-7acac0eecc41', '08a140d2-c844-49f9-9dd5-58f991d84594', 'წვერის მოვლა', 'Tsveris Movla', 'tsveris-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8444af76-b257-4c3b-9d14-a6913b98e1fa', '31f52c10-3c3b-4419-bdf2-aa1f762d0ab1', 'ეპილაციის ნემსი', 'Epilatsiis Nemsi', 'epilatsiis-nemsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('50bcdeba-510d-41b2-8965-cca07a328563', '31f52c10-3c3b-4419-bdf2-aa1f762d0ab1', 'ეპილაციის ქაღალდი', 'Epilatsiis Kaghaldi', 'epilatsiis-kaghaldi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('41f576fa-4fb1-4d58-84d0-e1d075c6d03c', '31f52c10-3c3b-4419-bdf2-aa1f762d0ab1', 'ცვილი', 'Tsvili', 'tsvili', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8b87ec22-b26b-4943-910a-5456a6b4d49e', '31f52c10-3c3b-4419-bdf2-aa1f762d0ab1', 'ცვილის გამათბობელი აპარატი', 'Tsvilis Gamatbobeli Aparati', 'tsvilis-gamatbobeli-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9bdab1af-1863-4829-aa76-faf4da840c7e', '10c4cdb8-5e07-451c-a68c-c55d5b628658', 'მედიკამენტები, ბიოდანამატები', 'and', 'medikamentebi-biodanamatebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('50928032-b30c-4d3d-a527-77794954a586', '10c4cdb8-5e07-451c-a68c-c55d5b628658', 'სამედიცინო ინვენტარი', 'Sameditsino Inventari', 'sameditsino-inventari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('88440b80-0d25-4185-857a-5487b69ed00e', '10c4cdb8-5e07-451c-a68c-c55d5b628658', 'სამედიცინო ოპტიკა', 'Sameditsino Optika', 'sameditsino-optika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1eacacd7-c044-4132-8c16-9d800dce2c0a', '10c4cdb8-5e07-451c-a68c-c55d5b628658', 'სამედიცინო დანადგარი', 'and', 'sameditsino-danadgari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e0ccd810-d7b7-4d5d-b2ce-75d6b551b9b9', '10c4cdb8-5e07-451c-a68c-c55d5b628658', 'სამედიცინო სახარჯი მასალა', 'Sameditsino Sakharji Masala', 'sameditsino-sakharji-masala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('18580872-40e5-489a-8917-da722e702123', '10c4cdb8-5e07-451c-a68c-c55d5b628658', 'სამედიცინო ხელსაწყო', 'Sameditsino Khelsatsqo', 'sameditsino-khelsatsqo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('260b079c-12a8-48c0-9530-3b32b25b8c00', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'საოჯახო მსხვილი ტექნიკა', 'Large Household Appliances', 'saojakho-mskhvili-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4d94ad09-ac68-4535-a13c-9dda2eeceef3', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'მონიტორი', 'Monitori', 'monitori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8b765b1d-a7a8-492a-b4ad-85360119e9dd', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'პლანშეტი', 'Plansheti', 'plansheti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('40ab85b0-0936-409a-9835-21a0ad202490', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'ტაბი', 'Tabi', 'tabi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('335c31e0-d86a-4062-9999-68807f282fe0', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'მობილურის ნაწილები', 'Mobiluris Natsilebi', 'mobiluris-natsilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6476313-cfc7-4edf-bcab-7d9fccdb3cd8', '309c9b08-71ac-4728-852d-b0a5a9ae709a', 'ბილეთი', 'Bileti', 'bileti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('faa6266f-f5ea-4864-a855-727512b07e33', '90d8c15b-2969-43a2-9c19-57622d1634af', 'ფოიერვერკი', 'Poierverki', 'poierverki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a1092905-1f46-4150-9ce5-4cf6e96dfb90', '591ac6de-56ee-4b72-9a85-f911b2572385', 'კატა', 'Kata', 'kata', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c6d7bf47-e980-45f8-bf32-96d66b3e4e09', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'კამეჩი', 'Kamechi', 'kamechi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('17b492a4-0b50-4d70-81b4-1232438f13cd', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'ღორი', 'Ghori', 'ghori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d88ad867-601c-42c2-8e0b-ba2792ac0bc0', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'ფიჭა', 'Picha', 'picha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa145ff9-0834-4ddf-985c-6a882ee828d1', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'ფუტკრის შესაწამლი აპარატი', 'Putkris Shesatsamli Aparati', 'putkris-shesatsamli-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5b1a09fe-4b47-44b3-a882-5bacee09c89b', 'fb5e2c93-e3f0-4c43-8503-dd90861539de', 'Bluetooth ტრეკერი', 'Bluetooth Trekeri', 'bluetooth-trekeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4ffcaa62-054d-4162-9544-523d609b0c1d', 'cf0335e3-c07c-4011-bf87-c73a674aa77e', 'გეიმინგ ყურსასმენების სადგამი', 'Geiming Qursasmenebis Sadgami', 'geiming-qursasmenebis-sadgami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb79bfc0-328d-42e2-981e-bbdf07fabe50', 'bc79bc68-fd52-4e45-823f-b7bcfbf598ba', 'გეიმპადი/კონტროლერი', 'Geimpadi Kontroleri', 'geimpadi-kontroleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0f6a9cf3-8ec5-46af-960f-63d9688290e9', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორი', 'Proektori', 'proektori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f413b206-2415-4668-b626-d5eb61b5867d', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორის პულტი', 'Proektoris Pulti', 'proektoris-pulti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ee4907a9-959c-4483-8fbd-953ed923538d', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'მაუსი', 'Mausi', 'mausi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac56259a-87e8-4031-b51c-660c29b6de13', '7026e25e-f491-4076-8d95-0915b17a6a8e', 'პროფესიონალური სამზარეულოს აღჭურვილობა/სახარჯი მასალა', 'Propesionaluri Samzareulos Aghchurviloba Sakharji Masala', 'propesionaluri-samzareulos-aghchurviloba-sakharji-masala', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7770a200-4743-454d-bfa6-baa290843880', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'ბუცი', 'Butsi', 'butsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9613af06-3681-47a9-9043-b17c72cb882a', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'რაგბი', 'Ragbi', 'ragbi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e16a4dd0-8234-4740-93c8-ed6f8410d660', 'cf629a21-15b2-4b8f-95b9-f5bc3573fcbe', 'რაციის აქსესუარები', 'Ratsiis Aksesuarebi', 'ratsiis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3c27d7cc-cf04-45d0-9b5f-2f2e11a86ca9', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'სამზარეულო ტექნიკა', 'Kitchen Appliances', 'samzareulo-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('02f105ee-5912-45b0-8bb1-72a863b188f8', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'ელექტრონული წიგნი', 'Book', 'elektronuli-tsigni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c76e6179-d87f-4897-b84e-e3020790d1dc', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'ტანსაცმლის/ფეხსაცმლის მოვლა', 'Tansatsmlis Pekhsatsmlis Movla', 'tansatsmlis-pekhsatsmlis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('35cd84f0-ae9e-4eac-ad97-35d29e6c530e', '3749a591-9ab4-4086-b797-ee15c5781d85', 'ზაზუნა', 'Zazuna', 'zazuna', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('28f1ea64-bf3b-4646-bd1c-dd13b02a4cbc', '90d8c15b-2969-43a2-9c19-57622d1634af', 'საახალწლო დეკორი', 'Saakhaltslo Dekori', 'saakhaltslo-dekori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b66112ac-d0bb-4e1c-801f-a8cee5e1c115', '131f607a-07f9-4d2d-ad3c-d0b5f8f98d67', 'აუდიო, ვიდეო, ფოტოტექნიკა', 'Technology', 'audio-video-pototeknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dda515a4-ae7d-4788-be80-693e15a60a27', '131f607a-07f9-4d2d-ad3c-d0b5f8f98d67', 'კავშირგაბმულობა', 'Kavshirgabmuloba', 'kavshirgabmuloba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6f4cb940-74b4-4dd2-a6c3-2c8ab3eb5e15', 'a87811fd-aeda-4544-a699-ac566a2c2376', 'სუვენირები/ხელნაკეთი ნაწარმი', 'Suvenirebi Khelnaketi Natsarmi', 'suvenirebi-khelnaketi-natsarmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e8263f77-2ca7-49fe-9373-cf926c513d96', 'a87811fd-aeda-4544-a699-ac566a2c2376', 'ანტიკვარიატი/კოლექცია', 'Antikvariati Kolektsia', 'antikvariati-kolektsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d95eaf6f-74d9-4c16-ae73-0886c989f2d3', 'bb92c02b-0473-499a-a314-6a9902ec29e9', 'საიუველირო ნაწარმი', 'Saiuveliro Natsarmi', 'saiuveliro-natsarmi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cf042e48-e79a-4bd1-9c80-f46178029443', 'bb92c02b-0473-499a-a314-6a9902ec29e9', 'სილამაზე და ჯანმრთელობა', 'and', 'silamaze-da-janmrteloba', '💄', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('37046868-99b6-477f-a589-4e11f3212c8f', 'd55a7743-2b7e-4ab6-8e7b-8fa0d1ec6da0', 'მუსიკალური ინსტრუმენტები', 'Music', 'musikaluri-instrumentebi', '🎵', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('524ec220-c4d2-4677-93b0-c5e87ddd6c20', '1146af06-88bb-4260-8b60-ebe56dad1584', 'ბიზნესი, დანადგარები', 'and', 'biznesi-danadgarebi', '💼', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2ac9a6d2-c4a9-48d5-a017-cdf3daeb4ad8', '591ac6de-56ee-4b72-9a85-f911b2572385', 'ეგზოტიკური ცხოველები', 'Animals', 'egzotikuri-tskhovelebi', '🐾', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8c8cc2ba-a3ec-4447-b7e5-16b7669256af', '94704310-95c9-43db-acbe-ed7b7bf1a9a0', 'სადღესასწაულო ნივთები', 'Items', 'sadghesastsaulo-nivtebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e31f3d79-d497-4526-959a-6428c057c492', '0c2165f7-f222-430c-9b86-825fefbca579', 'ელექტრონიკა და კომპონენტები', 'and', 'elektronika-da-komponentebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb2c1550-3bf6-45a9-9ae1-fcffc8b93d62', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'ცხვარი', 'Tskhvari', 'tskhvari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9bdef6a3-231d-4433-8394-2bef6756e34d', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'ფუტკრის ოჯახი', 'Putkris Ojakhi', 'putkris-ojakhi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9ff2bdba-d172-44c3-b1d6-d509f7d85942', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'მეფუტკრის ურიკა', 'Meputkris Urika', 'meputkris-urika', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('31e0bb2f-ec96-4aec-89bb-859128a573ee', 'fb5e2c93-e3f0-4c43-8503-dd90861539de', 'ეართაგი/სმარტთაგი', 'Eartagi Smarttagi', 'eartagi-smarttagi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('324d8acd-7910-49f1-8b8b-c9234dce00b4', '487e4cc7-bd22-4936-8ce4-be93ce2b4eff', 'IP ტელეფონი', 'IP Teleponi', 'ip-teleponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e3ccb193-9569-4194-bad0-900939401a9d', 'bc79bc68-fd52-4e45-823f-b7bcfbf598ba', 'გეიმპადი/კონტროლერის აქსესუარი', 'Geimpadi Kontroleris Aksesuari', 'geimpadi-kontroleris-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac4c3a5e-c844-45e4-9703-7c24e93a37c9', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორის ლამპა', 'Proektoris Lampa', 'proektoris-lampa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3d20c681-4ccc-48ea-8b70-9196afd2bc88', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'ქსეროქსი, კოპირების აპარატი', 'Kseroksi Kopirebis Aparati', 'kseroksi-kopirebis-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('866d1edd-efe3-4b4f-86cc-e1038742355c', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'პროექტორები/აქსესუარები', 'Proektorebi Aksesuarebi', 'proektorebi-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bcfaeff4-be77-4131-9f49-030baa0154bf', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'მაუსის პედი', 'Mausis Pedi', 'mausis-pedi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3a7ca34a-de2f-4c75-a455-c67afcd61c0b', '7026e25e-f491-4076-8d95-0915b17a6a8e', 'პროფესიონალური ტექნიკის სათადარიგო ნაწილები', 'and', 'propesionaluri-teknikis-satadarigo-natsilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8046131b-fcfc-44b3-bdb6-da40186c38ac', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'ბოტი', 'Boti', 'boti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('00f17e55-f17c-4268-97e0-f96ce2cd7f6c', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'წყალბურთი', 'Tsqalburti', 'tsqalburti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('53740690-5886-4d0a-a6e9-c30345798b9e', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ხელბურთი', 'Khelburti', 'khelburti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9ee15e58-6007-4145-90f3-29ae8f3c0487', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ფრენბურთი', 'Prenburti', 'prenburti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('21c20e5d-4575-4e44-9c02-f511f213101a', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'კალათბურთი', 'Kalatburti', 'kalatburti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('13b69dda-9cfc-474e-b385-221e0c1c9541', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'ჩასაშენებელი ტექნიკა', 'Built-in Appliances', 'chasashenebeli-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3cdde3ce-9ad3-414b-b970-2a62644bf26c', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'გრაფიკული პლანშეტი', 'Grapikuli Plansheti', 'grapikuli-plansheti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('46eb9120-cbd0-49d7-8741-a0d3128ac99a', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'სადღესასწაულო სამოსი ', 'Sadghesastsaulo Samosi', 'sadghesastsaulo-samosi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('75a52fab-ab84-4011-9b2d-6135f6bddccf', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'სმარტ საათი', 'Watch', 'smart-saati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('096f641b-fbfc-4bc1-b2ea-443e71f172cd', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'მეხსიერების მოდული', 'Mekhsierebis Moduli', 'mekhsierebis-moduli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bc08b838-088b-4935-813e-e182bee54df2', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'პროცესორი', 'Protsesori', 'protsesori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9da9a348-413e-4a29-ada8-7c145213fc9c', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ქეისი', 'Keisi', 'keisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c0c787bf-fb89-4d9c-b11b-7fd65966fabb', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ქსელის ბარათი', 'Kselis Barati', 'kselis-barati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('106fc6c9-9bac-4f5b-b9ec-e36ac65953df', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ქულერი', 'Kuleri', 'kuleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6a142cd-1d7e-4258-8695-08de6308d7e1', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ხმის ბარათი', 'Khmis Barati', 'khmis-barati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('80745939-1ceb-42be-a566-b82681cb1392', '3749a591-9ab4-4086-b797-ee15c5781d85', 'ზღვის გოჭი', 'Zghvis Gochi', 'zghvis-gochi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f55fff02-9a8d-4c89-a8ca-73c05a32ab75', 'b6763c94-864f-413f-a66b-25fe088f8aaf', 'ნოუთბუქის ვინჩესტერი', 'Noutbukis Vinchesteri', 'noutbukis-vinchesteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', '131f607a-07f9-4d2d-ad3c-d0b5f8f98d67', 'კომპიუტერული ტექნიკა', 'Technology', 'kompiuteruli-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b0249a47-2769-4533-911b-0fc80db5b75d', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'ჰიგიენა და ქიმია', 'and', 'higiena-da-kimia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3749a591-9ab4-4086-b797-ee15c5781d85', '591ac6de-56ee-4b72-9a85-f911b2572385', 'მღრღნელები', 'Mghrghnelebi', 'mghrghnelebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f86e126f-1b19-420c-a40f-cd541f9b8273', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'თხა', 'Tkha', 'tkha', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('75bdc52c-d56d-4ad4-8725-4f4d944ff73a', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'ფუტკრის რძე', 'Putkris Rdze', 'putkris-rdze', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b8bdc19b-d071-44cc-81bb-17ac84793d65', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'ფუტკრის ლაფეტი', 'Putkris Lapeti', 'putkris-lapeti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('023821e4-43e3-408d-b554-6e338bf30fa5', '487e4cc7-bd22-4936-8ce4-be93ce2b4eff', 'მინი ატს', 'Mini Ats', 'mini-ats', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c8b7682c-98df-45be-afad-7838d56ce3b8', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'პაჩკორდი', 'Pachkordi', 'pachkordi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('305363b3-bf7b-438a-8e4a-0274d592d58e', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'რეკი', 'Reki', 'reki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dc124894-a6e3-472b-a739-ebe6dd636875', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'სერვერი', 'Serveri', 'serveri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('38cfe7cb-bddb-43a4-9fb5-5542ca6b689a', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'ქსელის გამანაწილებელი (სვიჩი)', 'Kselis Gamanatsilebeli Svichi', 'kselis-gamanatsilebeli-svichi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('035475f2-97f1-45b8-ac34-7d32dfc16431', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'ქსელის ტესტერი', 'Kselis Testeri', 'kselis-testeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e7cdd10d-8735-4d0c-9a71-12f586d1803b', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'ქსელის უსაფრთხოება', 'Kselis Usaprtkhoeba', 'kselis-usaprtkhoeba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa5d2065-a224-4c72-b63d-6bc22c406640', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'ჯეკმეიქერი', 'Jekmeikeri', 'jekmeikeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d73aded7-89da-4c4e-9421-638dea29f924', 'c2c6b13c-228b-42ee-8839-3621d3073842', 'პლანშეტის დამცავი', 'and', 'planshetis-damtsavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('58caedb7-541f-408f-a050-7e1e179d671c', 'c2c6b13c-228b-42ee-8839-3621d3073842', 'პლანშეტის კალამი', 'Planshetis Kalami', 'planshetis-kalami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('55989aea-c116-4d52-b4bb-a1dd317c5041', 'c2c6b13c-228b-42ee-8839-3621d3073842', 'პლანშეტის კლავიატურა', 'Planshetis Klaviatura', 'planshetis-klaviatura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b91d14b6-f0ae-4233-afa9-61d7d72ec5e2', 'c2c6b13c-228b-42ee-8839-3621d3073842', 'პლანშეტის სადგამი', 'Planshetis Sadgami', 'planshetis-sadgami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b74e38ae-6041-4bba-93c8-b5f7105c1980', 'c2c6b13c-228b-42ee-8839-3621d3073842', 'პლანშეტის შალითა/ჩანთა', 'Planshetis Shalita Chanta', 'planshetis-shalita-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7742e9af-3ed3-4a24-901b-23c9e5af4ade', 'bc79bc68-fd52-4e45-823f-b7bcfbf598ba', 'Gift-ქარდები/PS Plus ბარათები', 'Gift Kardebi PS Plus Baratebi', 'gift-kardebi-ps-plus-baratebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cfa599f9-1532-46d4-9d47-71c3dc51d355', '2f1cd79f-c93b-4696-bc58-16fb3f2cce82', 'ნოუთბუქის ჩანთა', 'Noutbukis Chanta', 'noutbukis-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bf83cf90-9ab7-48e8-8115-5ab782b71497', '2f1cd79f-c93b-4696-bc58-16fb3f2cce82', 'ნოუთბუქის სადგამი', 'Noutbukis Sadgami', 'noutbukis-sadgami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0b2377b4-7e8e-4caa-8c10-e00234850d49', '2f1cd79f-c93b-4696-bc58-16fb3f2cce82', 'ნოუთბუქის ქეისი/დამცავი', 'and', 'noutbukis-keisi-damtsavi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d6402592-f386-4374-b19b-15185f59360d', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პრეზენტერი', 'Prezenteri', 'prezenteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('90ad2589-316b-4a02-9046-998d5ab84579', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორის ფილტრი', 'Proektoris Piltri', 'proektoris-piltri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9ce32d06-9629-4a3f-b4f7-885eb0642c85', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'პროექტორის ჩანთა', 'Proektoris Chanta', 'proektoris-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('17c407c2-8e37-4b5b-8154-38ec58814c45', '866d1edd-efe3-4b4f-86cc-e1038742355c', 'საკონფერენციო სისტემა', 'Sakonperentsio Sistema', 'sakonperentsio-sistema', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('06adc3df-6a11-4ce0-a005-a51e814779fd', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'პრინტერის კარტრიჯი', 'Printer', 'printeris-kartriji', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9c4da6e6-6d19-4861-99c3-5805b7f4701b', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'კალოში', 'Kaloshi', 'kaloshi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('031c8c6d-2ac0-48bd-a138-364602cfc5d4', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'მძლეოსნობა', 'Mdzleosnoba', 'mdzleosnoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c3f824b6-69d8-479c-a636-4a8c0b23f6d8', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'კრივი', 'Krivi', 'krivi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('114fe6c1-1a71-4235-8563-8e6e062891a0', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'გათბობა/გაგრილება', 'Heating/Cooling', 'gatboba-gagrileba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b771e7a9-7d93-4ee7-a504-bd866dda52be', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'აქსესუარები', 'Aksesuarebi', 'aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb5e2c93-e3f0-4c43-8503-dd90861539de', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'GPS მოწყობილობები', 'GPS Motsqobilobebi', 'gps-motsqobilobebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('447452db-02f8-49b3-9320-e8071f63dc74', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'დედაბარათი', 'and', 'dedabarati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('53c1b603-5413-4691-ad56-4a7f93171c9a', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ვიდეობარათი', 'Videobarati', 'videobarati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('dcdefca4-0287-4b52-86df-06ed62953019', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'კვების ბლოკი', 'Kvebis Bloki', 'kvebis-bloki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('274addd7-a089-465a-890e-7bfcdd03c676', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'თერმო პასტა', 'Termo Pasta', 'termo-pasta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b6763c94-864f-413f-a66b-25fe088f8aaf', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ვინჩესტერები', 'Vinchesterebi', 'vinchesterebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0ea5e227-792c-4a92-b609-f319acc67b04', '3749a591-9ab4-4086-b797-ee15c5781d85', 'დეკორატიული (ჯუჯა) კურდღელი', 'Dekoratiuli Juja Kurdgheli', 'dekoratiuli-juja-kurdgheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('737a3bcf-e871-4810-9029-2d705eb2d64f', 'b6763c94-864f-413f-a66b-25fe088f8aaf', 'გარე ვინჩესტერი', 'Gare Vinchesteri', 'gare-vinchesteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c482e778-d4ce-4253-accb-f7e2e285530f', 'b6763c94-864f-413f-a66b-25fe088f8aaf', 'დესკტოპ ვინჩესტერი', 'Desktop Vinchesteri', 'desktop-vinchesteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('44e997a1-feee-47f7-8f54-8be5e04751fd', '009db21a-6a40-47d2-86fe-c60b9df042ba', 'მწერებისა და მღრღნელებისგან დაცვა', 'and', 'mtserebisa-da-mghrghnelebisgan-datsva', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f423c4c2-66ef-4c18-bba9-a2c2dcb21110', '591ac6de-56ee-4b72-9a85-f911b2572385', 'მეცხოველეობა', 'Metskhoveleoba', 'metskhoveleoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('47a33ffd-647a-4d15-8131-947541d865aa', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'კურდღელი', 'Kurdgheli', 'kurdgheli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('43de0d38-769f-44bb-805d-04a4ca14d73f', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'ფუტკრის ცვილი (სანთელი)', 'Putkris Tsvili Santeli', 'putkris-tsvili-santeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('5032f34c-61c1-4fe7-85a7-a2479b22b87a', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'შხამის ასაღები აპარატი', 'Shkhamis Asaghebi Aparati', 'shkhamis-asaghebi-aparati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('21b5222a-7cbe-458e-b6c5-156fe1604945', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'Flash ბარათი', 'Flash Barati', 'flash-barati', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a461f5ee-f604-40b9-8828-ff2e548de24a', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'ვებკამერა', 'Vebkamera', 'vebkamera', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('53c99594-c7af-441a-8900-0b888de08f1e', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'სამუშაო ფეხსაცმელი', 'Footwear', 'samushao-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('4d149114-0b2b-4713-a1a1-61130fccb011', '34db3034-1581-4fed-acf6-826d4465f20c', 'თერმო ჩანთა', 'Termo Chanta', 'termo-chanta', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cd511e52-bf17-4987-9baf-14ab1b9587bf', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'თავის მოვლა', 'Personal Care', 'tavis-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e1446430-0cda-47b0-94ae-682df8f4d1a4', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'საოფისე ტექნიკა', 'Technology', 'saopise-teknika', '💻', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8644ce81-28e1-4f61-b772-8add28589194', 'ec5cf836-bd0b-4fde-9358-f9dccc8aa3dd', 'აქსესუარების ნაკრები', 'Aksesuarebis Nakrebi', 'aksesuarebis-nakrebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cf629a21-15b2-4b8f-95b9-f5bc3573fcbe', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'რაცია და აქსესუარები', 'and', 'ratsia-da-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('21e3a9ef-7da3-4832-ad4f-921935bf2c55', '591ac6de-56ee-4b72-9a85-f911b2572385', 'მეფრინველეობა', 'Meprinveleoba', 'meprinveleoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('134fd32f-8b3e-4c26-a713-daa2d08140b7', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'ცხენი', 'Tskheni', 'tskheni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('41f6d92c-6886-49c6-9afa-2ce39c488889', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'ფუტკრის შხამი', 'Putkris Shkhami', 'putkris-shkhami', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('8ee1117b-3601-401c-a7fc-a57264e928e6', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'ცვილის ფორმები', 'Tsvilis Pormebi', 'tsvilis-pormebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('70951e5a-7c24-4a5f-874e-5c6baf74e83a', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'Wifi გამაძლიერებელი', 'Wifi Gamadzlierebeli', 'wifi-gamadzlierebeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea478d31-003a-4e16-9f29-b84bee7ce65a', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'ლიცენზირებული პროგრამა', 'Litsenzirebuli Programa', 'litsenzirebuli-programa', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0fa8b02b-c27b-4016-9da6-6bd11e08d8b7', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'USB გაჯეტი', 'USB Gajeti', 'usb-gajeti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1433f117-0566-414a-848f-81f5080eee21', '3460b38b-4889-4f37-938b-01f5f7944a2d', 'საცეკვაო ფეხსაცმელი', 'Footwear', 'satsekvao-pekhsatsmeli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c878c0d1-99eb-464e-9561-1774292e526c', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'თეკვონდო', 'Tekvondo', 'tekvondo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('04470a8b-b900-4548-8604-b604301d4ff8', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'წყლის ფილტრაცია', 'Water Filtration', 'tsqlis-piltratsia', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'კომპიუტერის აქსესუარები', 'Kompiuteris Aksesuarebi', 'kompiuteris-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('487e4cc7-bd22-4936-8ce4-be93ce2b4eff', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'ფიქსირებული ტელეფონები', 'Piksirebuli Teleponebi', 'piksirebuli-teleponebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('228c4036-4d89-48be-b934-df986d722edc', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'CD/DVD/Blu Ray ამძრავები', 'CD DVD Blu Ray Amdzravebi', 'cd-dvd-blu-ray-amdzravebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('979eaedb-8257-43ba-8c90-d288246ff505', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ნოუთბუქის კლავიატურა', 'Noutbukis Klaviatura', 'noutbukis-klaviatura', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', '591ac6de-56ee-4b72-9a85-f911b2572385', 'მეფუტკრეობა', 'Meputkreoba', 'meputkreoba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('72953af0-2c7d-481f-9d3b-867686991106', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'ვირი', 'Viri', 'viri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fb48ac17-ccef-4356-919f-133fec3dc708', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'ყვავილის მტვერი/ჭეო', 'Qvavilis Mtveri Cheo', 'qvavilis-mtveri-cheo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('7e7532db-0422-4c7a-91ad-c0fb69c3fe73', 'b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', 'ფუტკრის რძის ასაღები ჩარჩო', 'Putkris Rdzis Asaghebi Charcho', 'putkris-rdzis-asaghebi-charcho', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('566d1de2-862c-4866-b04f-4a09598fbbcb', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'Wifi USB ადაპტერი', 'and', 'wifi-usb-adapteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('545cab48-19f8-491c-9952-93bcad865b04', 'e1446430-0cda-47b0-94ae-682df8f4d1a4', 'უწყვეტი კვების წყარო (UPS)', 'Utsqveti Kvebis Tsqaro UPS', 'utsqveti-kvebis-tsqaro-ups', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2275ea55-3579-4540-ac02-d7362d222464', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'კარატე', 'Karate', 'karate', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9f033ed4-4030-4591-9744-2eed608711fc', 'ce7cfdd3-92c7-4175-aca9-4bdfda304aaa', 'საოჯახო ტექნიკის სათადარიგო ნაწილები', 'Household Appliance Spare Parts', 'saojakho-teknikis-satadarigo-natsilebi', '🏠', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('2f1cd79f-c93b-4696-bc58-16fb3f2cce82', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'ნოუთბუქის აქსესუარები', 'Noutbukis Aksesuarebi', 'noutbukis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c2c6b13c-228b-42ee-8839-3621d3073842', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'პლანშეტის აქსესუარები', 'Planshetis Aksesuarebi', 'planshetis-aksesuarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f1e39703-81f8-43ed-9eb0-7a24b38abbe6', 'dda515a4-ae7d-4788-be80-693e15a60a27', 'მობილურის ნომერი', 'Mobiluris Nomeri', 'mobiluris-nomeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('a90b0e9e-2836-4037-968c-fb007bc62157', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ნოუთბუქის (დამტენი) კვების ბლოკი', 'and', 'noutbukis-damteni-kvebis-bloki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c45b16d6-ce60-4601-9d31-499537664554', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ნოუთბუქის აკუმულატორი', 'Noutbukis Akumulatori', 'noutbukis-akumulatori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ea23fb71-dafc-4712-8e07-df3c94b7b1de', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ნოუთბუქის მეხსიერების მოდული', 'Noutbukis Mekhsierebis Moduli', 'noutbukis-mekhsierebis-moduli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('d8a682d8-0c6a-4246-98ef-aea72c509f37', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'დინდგელი (პროპოლისი)', 'Dindgeli Propolisi', 'dindgeli-propolisi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b1595663-6c73-4c85-81ff-b0daa8d4c8fe', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'კომპიუტერის დინამიკი', 'Kompiuteris Dinamiki', 'kompiuteris-dinamiki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('41aa9cd1-df60-4210-a543-4aa4bc7008f4', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ბეისბოლი', 'Beisboli', 'beisboli', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('294c1781-4483-4315-8c04-9a8fc2a3a9ba', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ნოუთბუქის ეკრანი', 'Noutbukis Ekrani', 'noutbukis-ekrani', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('17045d4b-42ca-40bc-98e9-55dca474f331', 'f423c4c2-66ef-4c18-bba9-a2c2dcb21110', 'ჯორი', 'Jori', 'jori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b8f3d7c3-9fa4-418e-a2e2-ea0f0a7a15b1', '6ecd5d49-47d0-48cd-bad4-da6cbe61b72e', 'მეფუტკრეობის ხელსაწყო-დანადგარები', 'and', 'meputkreobis-khelsatsqo-danadgarebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('50da1bce-74a8-43ee-82b6-cba4712be5d8', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'აკვარიუმი/აქსესუარი', 'Akvariumi Aksesuari', 'akvariumi-aksesuari', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('047ac0fc-b99e-4ad6-b042-338be149d8bb', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'Wifi როუტერი', 'Wifi Routeri', 'wifi-routeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa8b81e7-82bd-4492-b566-c0480e8fa5a7', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'კომპიუტერის მიკროფონი', 'Kompiuteris Mikroponi', 'kompiuteris-mikroponi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'ქსელური მოწყობილობები', 'Kseluri Motsqobilobebi', 'kseluri-motsqobilobebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cb5a60fe-073a-48ec-b06d-b0b7cdc5517c', 'e9317ead-530c-48e6-b944-cdfaf8bb68cd', 'ცხოველთა მოვლა', 'Tskhovelta Movla', 'tskhovelta-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9f6a16aa-8f27-4c63-abcb-fdd1b8e38640', 'c1d788fd-cd63-4e25-8e71-310be1d92fa8', 'RJ ჯეკი', 'RJ Jeki', 'rj-jeki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('779308ef-5037-4642-ad6e-2a76f8688c7f', '2f1cd79f-c93b-4696-bc58-16fb3f2cce82', 'ნოუთბუქის ქულერი', 'Noutbukis Kuleri', 'noutbukis-kuleri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('475e1a74-3feb-49c6-8dcd-386022bf3f2b', 'c5d8a7a4-d4c3-44c4-bb82-4ea11c76386e', 'კაბელი/ადაპტერი', 'and', 'kabeli-adapteri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('894b1ed0-f283-4a58-a98a-d0bf7ca16ccf', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ჩოგბურთი', 'Chogburti', 'chogburti', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6b90a6c6-bea4-4dca-8a83-1e4ad11e778f', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'მაინერები', 'Mainerebi', 'mainerebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bd5dd1a6-ff76-483a-bda1-0348836a4d79', '3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'ნოუთბუქი ნაწილებად (იშლება)', 'Noutbuki Natsilebad Ishleba', 'noutbuki-natsilebad-ishleba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('fa1192dd-94fe-41ae-aefc-885e2e6a0296', '131f607a-07f9-4d2d-ad3c-d0b5f8f98d67', 'ელემენტები', 'Elementebi', 'elementebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cf3ca3e5-4cbf-4cb9-8cd2-dd853d3ec621', '1146af06-88bb-4260-8b60-ebe56dad1584', 'უსაფრთხოების სისტემები', 'Usaprtkhoebis Sistemebi', 'usaprtkhoebis-sistemebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('13288140-dbdf-4322-951c-cd49dd4d5ca5', '591ac6de-56ee-4b72-9a85-f911b2572385', 'ცხოველთა კვება', 'Tskhovelta Kveba', 'tskhovelta-kveba', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('149b88f0-f657-4ee1-890d-3bb82a31a398', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'პინგ-პონგი', 'Ping Pongi', 'ping-pongi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cf0335e3-c07c-4011-bf87-c73a674aa77e', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'გეიმინგი', 'Geimingi', 'geimingi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('b36026b5-afe2-4d57-8336-c9033c627879', 'b6763c94-864f-413f-a66b-25fe088f8aaf', 'SSD', 'SSD', 'ssd', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('e9317ead-530c-48e6-b944-cdfaf8bb68cd', '591ac6de-56ee-4b72-9a85-f911b2572385', 'აქსესუარები და მოვლა', 'and', 'aksesuarebi-da-movla', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('941b0a36-0837-4c92-a122-982fe35cbdb3', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ბადმინტონი', 'Badmintoni', 'badmintoni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('bea18c96-aa4c-4271-9e00-e0942003ecbe', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'CD/DVD/Blu Ray დისკები', 'CD DVD Blu Ray Diskebi', 'cd-dvd-blu-ray-diskebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3e791f05-5285-4df8-a093-8b75aff78a29', '591ac6de-56ee-4b72-9a85-f911b2572385', 'ვეტ-აფთიაქი', 'Vet Aptiaki', 'vet-aptiaki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('feed3700-d1ed-4d06-8d77-d3d944d30ef2', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'დარტსი', 'and', 'dartsi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('56e52846-c744-4dcb-a286-cffa419b2953', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ბილიარდი', 'Biliardi', 'biliardi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('3d32fb1f-87ef-4ba0-9fa6-2be5865f72b1', 'aa151f32-2bbb-40b7-bd1c-f80dd9b2aac1', 'კომპიუტერის ნაწილები', 'Kompiuteris Natsilebi', 'kompiuteris-natsilebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('71daa023-d850-4139-b23b-3df1d5472f96', '591ac6de-56ee-4b72-9a85-f911b2572385', 'გავაჩუქებ/ვიჩუქებ', 'Gavachukeb Vichukeb', 'gavachukeb-vichukeb', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('0559ec55-6639-47de-87fb-f37a6cfb8b36', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ბოულინგი', 'Boulingi', 'boulingi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f2411d2d-4f6a-4be4-a933-464369e97d3c', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ჭადრაკი', 'Chadraki', 'chadraki', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('9f3992aa-de22-4728-a579-2a61422fca88', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'გოლფი', 'Golpi', 'golpi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f9b63640-761e-43b6-a865-c3802e5a7367', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ტანვარჯიში', 'Tanvarjishi', 'tanvarjishi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('1525bb6f-151d-4b00-8eab-1987599870fd', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'ფიტნესი', 'Pitnesi', 'pitnesi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('6959409c-3e23-4910-b5e4-b7dc22087ac0', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'სპორტული ჯილდო', 'Sportuli Jildo', 'sportuli-jildo', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('aaeb2fc8-cb67-4eb1-ae11-7b1899b7b760', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'კაპიტნის სამკლაური', 'Kapitnis Samklauri', 'kapitnis-samklauri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f0b5ee59-9405-40bb-8cc4-26840a7a03eb', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'კუნთების მასაჟორი', 'Kuntebis Masazhori', 'kuntebis-masazhori', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('c6b7564a-5abf-4862-b83c-8907505d8bbf', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'მოედნის სანიშნები', 'Moednis Sanishnebi', 'moednis-sanishnebi', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('f2af043b-6c97-456c-a686-2baad3319cd7', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'პულსომეტრი', 'Pulsometri', 'pulsometri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('cb3847b0-1d38-4c22-9d92-3a2c54825082', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'სპორტული სასტვენი', 'Sportuli Sastveni', 'sportuli-sastveni', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ('ac6d7d1d-d2d8-4959-955e-66e241d1b182', 'e412f806-2ef8-49fe-ba25-4899d0f0ea7e', 'შეიკერი', 'Sheikeri', 'sheikeri', '📦', '#34C759', true, NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
