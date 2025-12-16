export enum SectionType {
  NearYou = 'NearYou',
  FreshFinds = 'FreshFinds',
  BestDeals = 'BestDeals',
  TrendingCategories = 'TrendingCategories',
  BudgetPicks = 'BudgetPicks',
  MostlyViewed = 'MostlyViewed',
}

// Extension to add functionName property to enum
export namespace SectionType {
  export function functionName(sectionType: SectionType): string {
    switch (sectionType) {
      case SectionType.NearYou:
        return 'fn_near_you';
      case SectionType.FreshFinds:
        return 'fn_fresh_finds';
      case SectionType.BestDeals:
        return 'fn_best_deals';
      case SectionType.TrendingCategories:
        return 'fn_trending_categories';
      case SectionType.BudgetPicks:
        return 'fn_budget_picks';
      case SectionType.MostlyViewed:
        return 'fn_mostly_viewed';
      default:
        return 'fn_near_you';
    }
  }

  export function displayName(sectionType: SectionType): string {
    switch (sectionType) {
      case SectionType.NearYou:
        return 'Near You';
      case SectionType.FreshFinds:
        return 'Fresh Finds';
      case SectionType.BestDeals:
        return 'Best Deals (Price)';
      case SectionType.TrendingCategories:
        return 'Trending Categories';
      case SectionType.BudgetPicks:
        return 'Budget Picks';
      case SectionType.MostlyViewed:
        return 'Mostly Viewed';
      default:
        return 'Near You';
    }
  }
}

