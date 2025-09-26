"use client";

import { Category } from "@/lib/api";
import { CategoryGridItem } from "./category-grid-item";

interface CategoryGridProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  isDeleting: string | null;
}

export function CategoryGrid({
  categories,
  onEdit,
  onDelete,
  isDeleting,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryGridItem
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting === category.id}
        />
      ))}
    </div>
  );
}
