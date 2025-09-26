"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconChevronRight,
  IconChevronDown,
  IconEdit,
  IconTrash,
  IconLoader,
  IconCategory,
} from "@tabler/icons-react";
import Image from "next/image";
import { Category } from "@/lib/api";

interface CategoryTreeItemProps {
  category: Category;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpanded: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  isDeleting: boolean;
}

export function CategoryTreeItem({
  category,
  level,
  hasChildren,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  isDeleting,
}: CategoryTreeItemProps) {
  return (
    <Card className={`ml-${level * 4}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpanded(category.id)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <IconChevronDown className="h-4 w-4" />
                ) : (
                  <IconChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            <div className="aspect-square relative bg-muted w-8 h-8 flex items-center justify-center rounded">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover rounded"
                />
              ) : (
                <IconCategory className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
              {category.description && (
                <p className="text-xs text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={category.isActive ? "default" : "secondary"}
              className="text-xs"
            >
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Order: {category.sortOrder}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category)}
              >
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
        </div>
      </CardContent>
    </Card>
  );
}
