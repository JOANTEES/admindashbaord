"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconEdit,
  IconTrash,
  IconLoader,
  IconCategory,
} from "@tabler/icons-react";
import Image from "next/image";
import { Category } from "@/lib/api";

interface CategoryGridItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  isDeleting: boolean;
}

export function CategoryGridItem({
  category,
  onEdit,
  onDelete,
  isDeleting,
}: CategoryGridItemProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative bg-muted flex items-center justify-center">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <IconCategory className="h-12 w-12" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">
            {category.name}
          </h3>
          <Badge
            variant={category.isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {category.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        {category.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {category.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs">
            Order: {category.sortOrder}
          </Badge>
          {category.parentId && (
            <Badge variant="outline" className="text-xs">
              Subcategory
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {new Date(category.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id)}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700"
            >
              {isDeleting ? (
                <IconLoader className="h-4 w-4 animate-spin" />
              ) : (
                <IconTrash className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
