const fs = require('fs');
const crypto = require('crypto');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('docs/cats.json', 'utf8'));
const categories = jsonData.Cats || [];

// Function to generate UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create mapping from old numeric ID to new UUID
const idMapping = new Map();
const categoriesByOldId = new Map();

// First pass: create UUIDs for all categories
categories.forEach(cat => {
  const newId = uuidv4();
  idMapping.set(cat.id, newId);
  categoriesByOldId.set(cat.id, { ...cat, newId });
});

// Function to generate slug from Georgian text (basic transliteration)
function generateSlug(text, oldId) {
  if (!text) return `category-${oldId}`;
  
  // Basic Georgian to Latin transliteration
  const transliteration = {
    'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v',
    'ზ': 'z', 'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm',
    'ნ': 'n', 'ო': 'o', 'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's',
    'ტ': 't', 'უ': 'u', 'ფ': 'p', 'ქ': 'k', 'ღ': 'gh', 'ყ': 'q',
    'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz', 'წ': 'ts', 'ჭ': 'ch',
    'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h'
  };
  
  let slug = text
    .toLowerCase()
    .split('')
    .map(char => transliteration[char] || (char.match(/[a-z0-9]/) ? char : '-'))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Ensure uniqueness by appending old ID if needed
  return slug || `category-${oldId}`;
}

// Function to generate emoji based on category (simple mapping)
function generateEmoji(text) {
  if (!text) return '📦';
  
  const textLower = text.toLowerCase();
  
  // Common category emojis
  if (textLower.includes('ტექნიკა') || textLower.includes('technique')) return '💻';
  if (textLower.includes('საოჯახო') || textLower.includes('household')) return '🏠';
  if (textLower.includes('სპორტი') || textLower.includes('sport')) return '⚽';
  if (textLower.includes('მუსიკა') || textLower.includes('music')) return '🎵';
  if (textLower.includes('საბავშვო') || textLower.includes('children')) return '🧸';
  if (textLower.includes('სილამაზე') || textLower.includes('beauty')) return '💄';
  if (textLower.includes('მშენებლობა') || textLower.includes('construction')) return '🔨';
  if (textLower.includes('წიგნები') || textLower.includes('books')) return '📚';
  if (textLower.includes('ცხოველები') || textLower.includes('animals')) return '🐾';
  if (textLower.includes('მომსახურება') || textLower.includes('service')) return '🛎️';
  if (textLower.includes('გაქირავება') || textLower.includes('rent')) return '🏡';
  if (textLower.includes('ხელოვნება') || textLower.includes('art')) return '🎨';
  if (textLower.includes('ნადირობა') || textLower.includes('hunting')) return '🎯';
  if (textLower.includes('სოფლის') || textLower.includes('agriculture')) return '🚜';
  if (textLower.includes('ბიზნესი') || textLower.includes('business')) return '💼';
  
  return '📦'; // Default emoji
}

// Function to translate Georgian to English (comprehensive dictionary + transliteration)
function translateToEnglish(georgianText) {
  if (!georgianText) return '';
  
  // Comprehensive translations dictionary
  const translations = {
    // Main categories
    'საახალწლო პროდუქცია': 'New Year Products',
    'მომსახურება': 'Services',
    'გაქირავება': 'Rent',
    'სახლი და ბაღი': 'Home and Garden',
    'საოჯახო ტექნიკა': 'Household Appliances',
    'ტექნიკა': 'Electronics',
    'ნადირობა და თევზაობა': 'Hunting and Fishing',
    'მუსიკა': 'Music',
    'საბავშვო': 'Children',
    'სილამაზე და მოდა': 'Beauty and Fashion',
    'მშენებლობა და რემონტი': 'Construction and Renovation',
    'სოფლის მეურნეობა': 'Agriculture',
    'ცხოველები': 'Animals',
    'სპორტი და დასვენება': 'Sports and Recreation',
    'ბიზნესი და დანადგარები': 'Business and Equipment',
    'წიგნები და კანცელარია': 'Books and Stationery',
    'ხელოვნება და საკოლექციო': 'Art and Collectibles',
    
    // Subcategories - Electronics
    'საოჯახო წვრილი ტექნიკა': 'Small Household Appliances',
    'საოჯახო მსხვილი ტექნიკა': 'Large Household Appliances',
    'სამზარეულო ტექნიკა': 'Kitchen Appliances',
    'ჩასაშენებელი ტექნიკა': 'Built-in Appliances',
    'გათბობა/გაგრილება': 'Heating/Cooling',
    'თავის მოვლა': 'Personal Care',
    'წყლის ფილტრაცია': 'Water Filtration',
    'საოჯახო ტექნიკის სათადარიგო ნაწილები': 'Household Appliance Spare Parts',
    'დესკტოპ კომპიუტერი': 'Desktop Computer',
    'მობილური ტელეფონი': 'Mobile Phone',
    'ხაზის ტელეფონი': 'Landline Phone',
    'GPS ნავიგატორი': 'GPS Navigator',
    'პრინტერი': 'Printer',
    'პროექტორის ეკრანი': 'Projector Screen',
    'გეიმინგ სავარძელი': 'Gaming Chair',
    'პორტატული დამტენი/Power Bank': 'Portable Charger/Power Bank',
    
    // Subcategories - Art & Collectibles
    'მარკები': 'Brands',
    'მოდელები': 'Models',
    'მონეტები, ბანკნოტები': 'Coins, Banknotes',
    'ქანდაკება, ფიგურა': 'Sculpture, Figure',
    'ავეჯი': 'Furniture',
    'არქეოლოგიური': 'Archaeological',
    'გამოჩენილი ადამიანების ნივთები': 'Famous People Items',
    'იარაღი': 'Weapons',
    'მედალი, სამკერდე ნიშანი': 'Medal, Badge',
    'მუსიკალური ინსტრუმენტი': 'Musical Instrument',
    'ნახატი': 'Painting',
    'საათი': 'Watch',
    'სამკაული': 'Jewelry',
    'საოჯახო ნივთები': 'Household Items',
    'სასმელი': 'Beverage',
    'საყვავილე, ლარნაკი': 'Vase, Lamp',
    'ფერწერა': 'Painting',
    'ციფრული ხელოვნება': 'Digital Art',
    'წიგნი': 'Book',
    'ჭურჭელი': 'Dishes',
    'ხალიჩა': 'Carpet',
    'ხატები, საეკლესიო ნივთები': 'Icons, Church Items',
    'ანტიკვარული სათამაშოები': 'Antique Toys',
    'მეტალო დეტექტორი': 'Metal Detector',
    'ნოტები': 'Sheet Music',
    'ჟურნალი': 'Magazine',
    
    // Clothing & Fashion
    'ტანსაცმელი და აქსესუარები': 'Clothing and Accessories',
    'ფეხსაცმელი': 'Footwear',
    'სალაშქრო ფეხსაცმელი': 'Hiking Boots',
    
    // Food & Agriculture
    'თაფლი': 'Honey',
    
    // Common word translations
    'და': 'and',
    'ნივთები': 'Items',
    'ტექნიკა': 'Technology',
    'საოჯახო': 'Household',
    'მსხვილი': 'Large',
    'წვრილი': 'Small'
  };
  
  // Check exact match first
  if (translations[georgianText]) {
    return translations[georgianText];
  }
  
  // Try partial matches for compound words
  for (const [key, value] of Object.entries(translations)) {
    if (georgianText.includes(key)) {
      // If it's a compound, try to build translation
      if (georgianText !== key) {
        const remaining = georgianText.replace(key, '').trim();
        if (remaining && translations[remaining]) {
          return `${value} ${translations[remaining]}`;
        }
      }
      return value;
    }
  }
  
  // Transliteration fallback - convert Georgian to readable English
  const transliterationMap = {
    'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v',
    'ზ': 'z', 'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm',
    'ნ': 'n', 'ო': 'o', 'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's',
    'ტ': 't', 'უ': 'u', 'ფ': 'p', 'ქ': 'k', 'ღ': 'gh', 'ყ': 'q',
    'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz', 'წ': 'ts', 'ჭ': 'ch',
    'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h'
  };
  
  let transliterated = georgianText
    .split('')
    .map(char => transliterationMap[char] || (char.match(/[a-zA-Z0-9\s]/) ? char : ' '))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return transliterated || georgianText;
}

// Generate SQL INSERT statements
const sqlStatements = [];
const color = '#34C759';

// Sort categories: parents first (pc === 0 or pc not in map), then children
// This ensures parent categories are inserted before their children
const sortedCategories = Array.from(categoriesByOldId.values())
  .sort((a, b) => {
    const aIsRoot = !a.pc || a.pc === 0 || !idMapping.has(a.pc);
    const bIsRoot = !b.pc || b.pc === 0 || !idMapping.has(b.pc);
    
    // Root categories (no parent) come first
    if (aIsRoot && !bIsRoot) return -1;
    if (!aIsRoot && bIsRoot) return 1;
    
    // Then sort by sort_order
    return (a.so || 0) - (b.so || 0);
  });

sortedCategories.forEach(cat => {
  const newId = cat.newId;
  const parentOldId = cat.pc;
  const parentId = parentOldId && parentOldId !== 0 ? idMapping.get(parentOldId) : null;
  const titleKa = cat.t || '';
  const titleEn = translateToEnglish(titleKa);
  const slug = generateSlug(titleKa, cat.id);
  const icon = generateEmoji(titleKa);
  const sortOrder = cat.so || 0;
  
  // Escape single quotes in SQL
  const escapeSQL = (str) => (str || '').replace(/'/g, "''");
  
  sqlStatements.push(
    `INSERT INTO public.categories (id, parent_id, title_ka, title_en, slug, icon, color, is_active, created_at) VALUES ` +
    `('${newId}', ${parentId ? `'${parentId}'` : 'NULL'}, '${escapeSQL(titleKa)}', '${escapeSQL(titleEn)}', '${slug}', '${icon}', '${color}', true, NOW());`
  );
});

// Write SQL to file
const sqlContent = `-- Migration: Insert categories from cats.json
-- Generated from docs/cats.json
-- Total categories: ${categories.length}

BEGIN;

-- Clear existing categories (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE public.categories CASCADE;

${sqlStatements.join('\n')}

COMMIT;
`;

fs.writeFileSync('supabase/migrations/20251206211000_seed_categories_from_json.sql', sqlContent);

console.log(`✅ Generated SQL migration with ${categories.length} categories`);
console.log(`📁 File: supabase/migrations/20251206211000_seed_categories_from_json.sql`);

