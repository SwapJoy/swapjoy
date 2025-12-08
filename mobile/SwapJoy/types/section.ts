export enum SectionType {
  NearYou = 'NearYou',
  FreshFinds = 'FreshFinds',
  FavouriteCategories = 'FavouriteCategories',
  BestDeals = 'BestDeals',
  TopPicksForYou = 'TopPicksForYou',
  TrendingCategories = 'TrendingCategories',
  BudgetPicks = 'BudgetPicks',
}

// Extension to add functionName property to enum
export namespace SectionType {
  export function functionName(sectionType: SectionType): string {
    switch (sectionType) {
      case SectionType.NearYou:
        return 'fn_near_you';
      case SectionType.FreshFinds:
        return 'fn_fresh_finds';
      case SectionType.FavouriteCategories:
        return 'fn_favourite_categories';
      case SectionType.BestDeals:
        return 'fn_best_deals';
      case SectionType.TopPicksForYou:
        return 'fn_top_picks_for_you';
      case SectionType.TrendingCategories:
        return 'fn_trending_categories';
      case SectionType.BudgetPicks:
        return 'fn_budget_picks';
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
      case SectionType.FavouriteCategories:
        return 'Favourite Categories';
      case SectionType.BestDeals:
        return 'Best Deals (Price)';
      case SectionType.TopPicksForYou:
        return 'Top Picks';
      case SectionType.TrendingCategories:
        return 'Trending Categories';
      case SectionType.BudgetPicks:
        return 'Budget Picks';
      default:
        return 'Near You';
    }
  }
}

