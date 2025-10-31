# Currency Exchange Rates Management

## Overview
SwapJoy uses Georgian National Bank exchange rates from Business Online API to support multi-currency listings. Rates are updated daily at 1:00 AM UTC (5:00 AM Tbilisi time).

## Database

### Currencies Table
Stores exchange rates with GEL as the base currency:

```sql
CREATE TABLE currencies (
  code VARCHAR(3) PRIMARY KEY,        -- GEL, USD, EUR
  symbol VARCHAR(5) NOT NULL,         -- ₾, $, €
  rate DECIMAL(10, 4) NOT NULL,       -- Rate relative to GEL
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Current Rates:**
- GEL: 1.0 (base currency)
- USD: ~2.71 GEL
- EUR: ~3.15 GEL

## Daily Update Job

### Cron Job Configuration
- **Name:** `update-exchange-rates-daily`
- **Schedule:** `0 1 * * *` (1:00 AM UTC daily)
- **Status:** ✅ Active
- **Database:** postgres

### Edge Function
**Location:** `supabase/functions/update-exchange-rates/index.ts`

**API Endpoint:**
- `https://glbvyusqksnoyjuztceo.supabase.co/functions/v1/update-exchange-rates`

**API Source:**
- `https://api.businessonline.ge/api/rates/nbg/{USD|EUR}`

## How to Manage

### View Cron Jobs
```sql
-- See all cron jobs
SELECT * FROM cron_jobs_view;

-- Or directly
SELECT * FROM cron.job;
```

### Check Currency Rates
```sql
-- Current rates
SELECT * FROM currencies ORDER BY code;

-- Last update time
SELECT code, rate, updated_at 
FROM currencies 
ORDER BY updated_at DESC;
```

### Manually Update Rates
```sql
-- Trigger update manually
SELECT update_currency_rates();

-- Or call Edge Function directly
curl -X POST "https://glbvyusqksnoyjuztceo.supabase.co/functions/v1/update-exchange-rates" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### Manage Cron Job
```sql
-- Disable the job
SELECT cron.unschedule('update-exchange-rates-daily');

-- Enable the job
SELECT cron.schedule(
  'update-exchange-rates-daily',
  '0 1 * * *',
  $$SELECT update_currency_rates()$$
);

-- Check execution history
SELECT * 
FROM cron.job_run_details 
WHERE jobid = 2  -- Replace with your jobid
ORDER BY start_time DESC 
LIMIT 10;
```

## Edge Function Logs

View logs in Supabase Dashboard:
1. Go to **Edge Functions** section
2. Click on `update-exchange-rates`
3. View **Logs** tab

Or via MCP:
```typescript
mcp_SwapJoy_get_logs({ service: "edge-function" })
```

## Notes

- **Base Currency:** GEL (always 1.0)
- **Update Frequency:** Daily at 1 AM UTC
- **Supported Currencies:** GEL, USD, EUR
- **Rate Source:** Business Online API (NBG official rates)
- **Data Format:** Rate = how many GEL per 1 unit of currency

## Implementation Status

✅ Currencies table created  
✅ Edge Function deployed  
✅ Daily cron job scheduled  
✅ Manual update tested  
✅ SQL matching functions updated with currency conversion  
✅ Currency conversion helper functions added  
✅ API updated to use currency-aware matching  
✅ Currency selector UI added to ItemDetailsFormScreen  
✅ All display components show correct currency symbols

## Technical Details

### Currency Conversion Functions

```sql
-- Convert any currency amount to GEL
convert_to_gel(amount DECIMAL, currency_code VARCHAR(3)) RETURNS DECIMAL

-- Get currency symbol
get_currency_symbol(currency_code VARCHAR(3)) RETURNS VARCHAR(5)
```

### Matching Algorithm

The `match_items` SQL function now:
1. Accepts `user_currency` parameter
2. Converts `min_value` from user's currency to GEL
3. Compares all items by converting their prices to GEL
4. Returns items with prices ≥ converted threshold, regardless of currency

Example:
```sql
-- User searches with 100 USD minimum
-- System converts to 271.39 GEL
-- Returns: 100 USD items, 50 EUR items, 200 GEL items, etc.
-- All converted and compared in GEL
```

## UI Implementation

### Currency Picker
Users can select currency when creating items:
- **USD** ($) - US Dollar
- **EUR** (€) - Euro
- **GEL** (₾) - Georgian Lari

Location: `ItemDetailsFormScreen.tsx` - Currency selector modal

### Display Components
All price displays throughout the app use the `formatCurrency` utility:
- `ItemDetailsScreen.tsx` - Item detail view
- `ExploreScreen.tsx` - Top picks, recent items, grid
- `BundleItemsScreen.tsx` - Bundle items
- `OfferCreateScreen.tsx` - Offer items
- `OfferPreviewScreen.tsx` - Offer preview
- `ItemPreviewScreen.tsx` - Item preview
- `ProfileScreen.tsx` - User's items grid

### Utility Functions
```typescript
// Format currency with symbol
formatCurrency(amount: number, currencyCode: string): string
// Example: formatCurrency(100, 'USD') => "$100.00"

// Get currency symbol
getCurrencySymbol(currencyCode: string): string
// Example: getCurrencySymbol('EUR') => "€"
```

Location: `mobile/SwapJoy/utils/index.ts`

