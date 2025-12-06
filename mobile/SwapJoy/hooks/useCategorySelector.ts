import { useState, useMemo, useCallback } from 'react';
import { useCategories, Category, CategoryTreeNode } from './useCategories';

interface UseCategorySelectorProps {
  multiselect: boolean;
  initialSelected: string[];
}

interface UseCategorySelectorReturn {
  rootCategories: CategoryTreeNode[];
  selectedCategoryIds: string[];
  expandedCategoryIds: Set<string>;
  loading: boolean;
  toggleCategory: (category: Category | CategoryTreeNode) => void;
  getCategoryChildren: (categoryId: string) => CategoryTreeNode[];
  isCategorySelected: (categoryId: string) => boolean;
  isCategoryExpanded: (categoryId: string) => boolean;
  isCategoryLeaf: (categoryId: string) => boolean;
  hasSelectedDescendants: (categoryId: string) => boolean;
  getSelectedDescendantsCount: (categoryId: string) => number;
  selectedCount: number;
}

/**
 * Hook for managing category selection logic
 * Handles selection, expansion, and tree navigation
 */
export const useCategorySelector = ({
  multiselect,
  initialSelected,
}: UseCategorySelectorProps): UseCategorySelectorReturn => {
  const { categories, loading, getCategoryTree, isLeafNode } = useCategories();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialSelected);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());

  // Get full tree structure
  const fullCategoryTree = useMemo(() => {
    return getCategoryTree();
  }, [getCategoryTree]);

  // Get root categories only (categories with no parent_id)
  const rootCategories = useMemo(() => {
    return fullCategoryTree.filter((cat) => !cat.parent_id);
  }, [fullCategoryTree]);

  // Helper to get children of a category from the tree
  const getCategoryChildren = useCallback(
    (categoryId: string): CategoryTreeNode[] => {
      const findNode = (nodes: CategoryTreeNode[]): CategoryTreeNode | null => {
        for (const node of nodes) {
          if (node.id === categoryId) return node;
          const found = findNode(node.children);
          if (found) return found;
        }
        return null;
      };
      const node = findNode(fullCategoryTree);
      return node?.children || [];
    },
    [fullCategoryTree]
  );

  // Toggle category selection or expansion
  const toggleCategory = useCallback(
    (category: Category | CategoryTreeNode) => {
      const isLeaf = isLeafNode(category.id);

      if (isLeaf) {
        // Leaf node: select/deselect
        if (multiselect) {
          setSelectedCategoryIds((prev) => {
            if (prev.includes(category.id)) {
              return prev.filter((id) => id !== category.id);
            }
            return [...prev, category.id];
          });
        } else {
          // Single select: replace selection
          setSelectedCategoryIds([category.id]);
        }
      } else {
        // Parent node: toggle expansion
        setExpandedCategoryIds((prev) => {
          const next = new Set(prev);
          if (next.has(category.id)) {
            next.delete(category.id);
          } else {
            next.add(category.id);
          }
          return next;
        });
      }
    },
    [multiselect, isLeafNode]
  );

  // Helper functions
  const isCategorySelected = useCallback(
    (id: string) => selectedCategoryIds.includes(id),
    [selectedCategoryIds]
  );

  const isCategoryExpanded = useCallback(
    (id: string) => expandedCategoryIds.has(id),
    [expandedCategoryIds]
  );

  const isCategoryLeaf = useCallback(
    (id: string) => isLeafNode(id),
    [isLeafNode]
  );

  // Check if a category has any selected descendants
  const hasSelectedDescendants = useCallback(
    (categoryId: string): boolean => {
      const findNode = (nodes: CategoryTreeNode[]): CategoryTreeNode | null => {
        for (const node of nodes) {
          if (node.id === categoryId) return node;
          const found = findNode(node.children);
          if (found) return found;
        }
        return null;
      };

      const node = findNode(fullCategoryTree);
      if (!node) return false;

      const checkDescendants = (n: CategoryTreeNode): boolean => {
        // Check if any child is selected
        for (const child of n.children) {
          if (selectedCategoryIds.includes(child.id)) {
            return true;
          }
          // Recursively check descendants
          if (checkDescendants(child)) {
            return true;
          }
        }
        return false;
      };

      return checkDescendants(node);
    },
    [fullCategoryTree, selectedCategoryIds]
  );

  // Count selected descendants
  const getSelectedDescendantsCount = useCallback(
    (categoryId: string): number => {
      const findNode = (nodes: CategoryTreeNode[]): CategoryTreeNode | null => {
        for (const node of nodes) {
          if (node.id === categoryId) return node;
          const found = findNode(node.children);
          if (found) return found;
        }
        return null;
      };

      const node = findNode(fullCategoryTree);
      if (!node) return 0;

      const countDescendants = (n: CategoryTreeNode): number => {
        let count = 0;
        for (const child of n.children) {
          if (selectedCategoryIds.includes(child.id)) {
            count++;
          }
          // Recursively count descendants
          count += countDescendants(child);
        }
        return count;
      };

      return countDescendants(node);
    },
    [fullCategoryTree, selectedCategoryIds]
  );

  const selectedCount = useMemo(() => selectedCategoryIds.length, [selectedCategoryIds]);

  return {
    rootCategories,
    selectedCategoryIds,
    expandedCategoryIds,
    loading,
    toggleCategory,
    getCategoryChildren,
    isCategorySelected,
    isCategoryExpanded,
    isCategoryLeaf,
    hasSelectedDescendants,
    getSelectedDescendantsCount,
    selectedCount,
  };
};

