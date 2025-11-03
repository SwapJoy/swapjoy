export type ItemMini = { id: string; price: number; currency: string };
export type RateMap = Record<string, number>;

export type Bundle = { itemIds: string[]; totalBase: number; score: number };

export function findBundlesByAccuracy(
  targetPriceBase: number,
  userItems: ItemMini[],
  rates: RateMap,
  accuracy: number,
  opts?: { baseCurrency?: string; maxItemsPerBundle?: number; maxResults?: number }
): Bundle[] {
  const base = opts?.baseCurrency ?? 'USD';
  const cap = Math.max(1, Math.min(3, opts?.maxItemsPerBundle ?? 3));
  const maxResults = Math.min(5, Math.max(1, opts?.maxResults ?? 5));

  const toBase = (price: number, cur: string) => {
    const rBase = rates[base] ?? 1;
    const rCur = rates[cur] ?? 1;
    return price * (rCur / rBase);
  };

  const items = userItems
    .map(i => ({ ...i, priceBase: toBase(i.price, i.currency) }))
    .filter(i => isFinite(i.priceBase) && i.priceBase > 0)
    .sort((a, b) => a.priceBase - b.priceBase);

  const t = targetPriceBase;
  const tol = Math.min(1, Math.max(0, 1 - accuracy));
  const minTotal = t * (1 - tol);
  const maxTotal = t * (1 + tol);
  const scoreOf = (sum: number) => 1 - Math.abs(sum - t) / (t * (tol || 1e-9));

  const results: Bundle[] = [];
  const seenCombos = new Set<string>();
  const n = items.length;

  for (let i = 0; i < n; i++) {
    const s = items[i].priceBase;
    if (s >= minTotal && s <= maxTotal) {
      const key = [items[i].id].join(',');
      if (!seenCombos.has(key)) {
        seenCombos.add(key);
        results.push({ itemIds: [items[i].id], totalBase: s, score: scoreOf(s) });
      }
    }
  }

  if (cap >= 2) {
    for (let i = 0; i < n; i++) {
      const a = items[i].priceBase; if (a > maxTotal) break;
      for (let j = i + 1; j < n; j++) {
        const s = a + items[j].priceBase; if (s > maxTotal) break;
        if (s >= minTotal) {
          const key = [items[i].id, items[j].id].sort().join(',');
          if (!seenCombos.has(key)) {
            seenCombos.add(key);
            results.push({ itemIds: [items[i].id, items[j].id], totalBase: s, score: scoreOf(s) });
          }
        }
      }
    }
  }

  if (cap >= 3) {
    for (let i = 0; i < n; i++) {
      const a = items[i].priceBase; if (a > maxTotal) break;
      for (let j = i + 1; j < n; j++) {
        const ab = a + items[j].priceBase; if (ab > maxTotal) break;
        for (let k = j + 1; k < n; k++) {
          const s = ab + items[k].priceBase; if (s > maxTotal) break;
          if (s >= minTotal) {
            const key = [items[i].id, items[j].id, items[k].id].sort().join(',');
            if (!seenCombos.has(key)) {
              seenCombos.add(key);
              results.push({ itemIds: [items[i].id, items[j].id, items[k].id], totalBase: s, score: scoreOf(s) });
            }
          }
        }
      }
    }
  }

  const seen = new Set<string>();
  const unique = results.filter(r => {
    const key = r.itemIds.slice().sort().join(',');
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  unique.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.itemIds.length !== b.itemIds.length) return a.itemIds.length - b.itemIds.length;
    return Math.abs(a.totalBase - t) - Math.abs(b.totalBase - t);
  });

  return unique.slice(0, maxResults);
}

