"use client";

import { Category } from "@/lib/api";
import { CategoryTreeItem } from "./category-tree-item";

interface CategoryTreeProps {
  categories: Category[];
  expandedCategories: Set<string>;
  onToggleExpanded: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  isDeleting: string | null;
  getChildCategories: (parentId: string) => Category[];
}

export function CategoryTree({
  categories,
  expandedCategories,
  onToggleExpanded,
  onEdit,
  onDelete,
  isDeleting,
  getChildCategories,
}: CategoryTreeProps) {
  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => {
      const childCategories = getChildCategories(category.id);
      const hasChildren = childCategories.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <div key={category.id} className="space-y-2">
          <CategoryTreeItem
            category={category}
            level={level}
            hasChildren={hasChildren}
            isExpanded={isExpanded}
            onToggleExpanded={onToggleExpanded}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting === category.id}
          />
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderCategoryTree(getChildCategories(category.id), level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return <div className="space-y-2">{renderCategoryTree(categories)}</div>;
}
