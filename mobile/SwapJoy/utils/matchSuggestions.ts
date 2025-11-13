export type ItemMini = { id: string; price: number; currency: string };
export type RateMap = Record<string, number>;

export type Bundle = { itemIds: string[]; totalBase: number; score: number };

/**
 * Price tolerance multiplier used for match generation.
 *
 * Interpretation:
 *   - Value is a scalar in the 0-100 range (but decimals are allowed).
 *   - The allowed price window is calculated as:
 *        toleranceValue = MATCH_PRICE_TOLERANCE * targetPrice
 *        minPrice = targetPrice - toleranceValue (clamped at 0)
 *        maxPrice = targetPrice + toleranceValue
 *
 * Examples (target price = 100):
 *   MATCH_PRICE_TOLERANCE = 0.5  → window [50, 150]
 *   MATCH_PRICE_TOLERANCE = 50   → window [0, 5_100]
 */
export const MATCH_PRICE_TOLERANCE = 2;

/**
 * Dedicated tolerance multiplier for bundle generation.
 * Defaults to a wider window than single-item matches.
 */
export const MATCH_BUNDLE_TOLERANCE = 2.5;

export function convertPriceToBase(
  price: number,
  currency: string,
  rates: RateMap,
  baseCurrency = 'USD'
): number {
  if (!Number.isFinite(price)) return 0;
  const baseRate = rates[baseCurrency] ?? 1;
  const currencyRate = rates[currency] ?? 1;
  if (!Number.isFinite(baseRate) || baseRate === 0) return price;
  return (price * currencyRate) / baseRate;
}

export function convertBaseToCurrency(
  priceBase: number,
  targetCurrency: string,
  rates: RateMap,
  baseCurrency = 'USD'
): number {
  const baseRate = rates[baseCurrency] ?? 1;
  const targetRate = rates[targetCurrency] ?? 1;
  if (!Number.isFinite(baseRate) || baseRate === 0) return priceBase;
  return priceBase * (targetRate / baseRate);
}

export function findAllBundles(
  userItems: ItemMini[],
  rates: RateMap,
  opts?: { baseCurrency?: string; maxItemsPerBundle?: number; maxResults?: number }
): Bundle[] {
  const base = opts?.baseCurrency ?? 'USD';
  const cap = Math.max(2, Math.min(4, opts?.maxItemsPerBundle ?? 3));
  const maxResults = Math.max(1, opts?.maxResults ?? 500);

  const safeRate = (c: string) => {
    const r = rates[c];
    return Number.isFinite(r) && r! > 0 ? r! : 1;
  };
  const toBaseCents = (price: number, cur: string) => {
    const rBase = safeRate(base);
    const rCur = safeRate(cur);
    const baseFloat = price * (rCur / rBase);
    return Math.max(0, Math.round(baseFloat * 100));
  };

  const items = userItems
    .filter((item) => item && Number.isFinite(item.price) && item.price > 0 && item.id)
    .map((item) => ({ id: String(item.id), cents: toBaseCents(item.price, item.currency) }))
    .sort((a, b) => (a.cents - b.cents) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  if (!items.length) return [];

  const results: Bundle[] = [];
  const seenKeys = new Set<string>();
  const pathIds: string[] = [];
  let pathSum = 0;

  function dfs(start: number) {
    for (let i = start; i < items.length; i++) {
      const current = items[i];
      pathIds.push(current.id);
      pathSum += current.cents;

      if (pathIds.length >= 2) {
        const key = pathIds.slice().sort().join(',');
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            itemIds: pathIds.slice(),
            totalBase: pathSum / 100,
            score: 1,
          });
        }
        if (results.length >= maxResults) {
          pathSum -= current.cents;
          pathIds.pop();
          return;
        }
      }

      if (pathIds.length < cap) {
        dfs(i + 1);
        if (results.length >= maxResults) {
          pathSum -= current.cents;
          pathIds.pop();
          return;
        }
      }

      pathSum -= current.cents;
      pathIds.pop();
    }
  }

  dfs(0);

  return results;
}