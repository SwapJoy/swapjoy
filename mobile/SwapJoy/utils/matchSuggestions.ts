export type ItemMini = { id: string; price: number; currency: string };
export type RateMap = Record<string, number>;

export type Bundle = { itemIds: string[]; totalBase: number; score: number };

// Compute up to 5 unique bundles for a given target composed of bundle items.
// Params:
// - accuracy: number in [0,1]; higher means tighter tolerance to target price
// - bundleItems: array of items that form the target (must include id/price/currency or compatible shape)
// - rates: currency rate map
// - userItems: current user's published items to use for composing bundles
// - opts: baseCurrency (default USD), maxItemsPerBundle (default 3), maxResults (default 5)
export function getUniqueBundlesForTarget(
  accuracy: number,
  bundleItems: Array<{ id?: string; item?: { id?: string; price?: number; currency?: string }; price?: number; currency?: string }>,
  rates: RateMap,
  userItems: ItemMini[],
  opts?: { baseCurrency?: string; maxItemsPerBundle?: number; maxResults?: number }
): Bundle[] {
  const base = opts?.baseCurrency ?? 'USD';
  const rBase = rates[base] ?? 1;

  const toBase = (price: number, cur: string) => {
    const rCur = rates[cur] ?? 1;
    return price * (rCur / rBase);
  };

  // Sum target bundle price in base currency; tolerate partial data
  const targetPriceBase = (bundleItems || []).reduce((sum, bi) => {
    const p = (bi.price ?? bi.item?.price ?? 0) as number;
    const c = (bi.currency ?? bi.item?.currency ?? base) as string;
    if (!p || !isFinite(p)) return sum;
    return sum + toBase(p, c);
  }, 0);

  if (!targetPriceBase || !isFinite(targetPriceBase) || targetPriceBase <= 0) {
    return [];
  }

  // Delegate to the lower-level finder which already dedupes and caps results
  return findBundlesByAccuracy(targetPriceBase, userItems, rates, accuracy, opts);
}

export function findBundlesByAccuracy(
  targetPriceBase: number,
  userItems: ItemMini[],
  rates: RateMap,
  accuracy: number,
  opts?: { baseCurrency?: string; maxItemsPerBundle?: number; maxResults?: number }
): Bundle[] {
  const base = opts?.baseCurrency ?? "USD";
  const cap = Math.max(1, Math.min(3, opts?.maxItemsPerBundle ?? 3));
  const maxResults = Math.min(5, Math.max(1, opts?.maxResults ?? 5));

  if (!Number.isFinite(targetPriceBase) || targetPriceBase <= 0) return [];

  // ---- currency → base cents (float-safe)
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

  // Normalize & sort
  const items = userItems
    .filter(i => i && Number.isFinite(i.price) && i.price > 0 && i.id)
    .map(i => ({ id: String(i.id), cents: toBaseCents(i.price, i.currency) }))
    // (optional upstream de-dupe by id)
    .sort((a, b) => (a.cents - b.cents) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  if (!items.length) return [];

  // ---- tolerance window
  const tCents = Math.round(targetPriceBase * 100);
  const tol = Math.min(1, Math.max(0, 1 - accuracy)); // acc=1→0, acc=0→1
  const minTotal = Math.max(0, Math.floor(tCents * (1 - tol)));
  const maxTotal = Math.ceil(tCents * (1 + tol));

  // Score: 1 at perfect match, 0 at tolerance edge (stable at acc=1)
  const denom = Math.max(1, Math.round(tCents * Math.max(tol, 1e-6)));
  const scoreOf = (sumCents: number) => 1 - Math.abs(sumCents - tCents) / denom;

  const keyOf = (ids: string[]) => ids.slice().sort().join(",");
  const seenKeys = new Set<string>();

  type Node = { ids: string[]; sum: number; score: number };
  const results: Node[] = [];

  const pushIfNew = (ids: string[], sum: number) => {
    const k = keyOf(ids);
    if (seenKeys.has(k)) return;
    seenKeys.add(k);
    results.push({ ids: ids.slice(), sum, score: scoreOf(sum) });
  };

  // ---- DFS with pruning; limit depth by `cap`
  const pathIds: string[] = [];
  let pathSum = 0;

  function dfs(start: number, depth: number) {
    if (pathSum > maxTotal) return;
    if (pathSum >= minTotal && pathIds.length > 0) pushIfNew(pathIds, pathSum);
    if (depth >= cap) return;

    for (let i = start; i < items.length; i++) {
      // If there are true duplicate rows (same id & cents), skip them at same depth
      if (i > start && items[i].cents === items[i - 1].cents && items[i].id === items[i - 1].id) continue;

      const nextSum = pathSum + items[i].cents;
      if (nextSum > maxTotal) break; // sorted by cents → further will exceed too

      pathIds.push(items[i].id);
      const prev = pathSum;
      pathSum = nextSum;

      dfs(i + 1, depth + 1);

      pathSum = prev;
      pathIds.pop();
    }
  }

  dfs(0, 0);

  // ---- rank, cap, and map out
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.ids.length !== b.ids.length) return a.ids.length - b.ids.length;
    const da = Math.abs(a.sum - tCents);
    const db = Math.abs(b.sum - tCents);
    if (da !== db) return da - db;
    // final tie-breaker for determinism
    return keyOf(a.ids) < keyOf(b.ids) ? -1 : 1;
  });

  return results.slice(0, maxResults).map(r => ({
    itemIds: r.ids,
    totalBase: r.sum / 100,
    score: r.score,
  }));
}