"use client";

import { Card, CardContent } from "@/components/ui/card";

interface CategoryStatsProps {
  totalCategories: number;
  rootCategories: number;
  filteredCategories: number;
  activeCategories: number;
}

export function CategoryStats({
  totalCategories,
  rootCategories,
  filteredCategories,
  activeCategories,
}: CategoryStatsProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalCategories}</div>
            <div className="text-sm text-muted-foreground">
              Total Categories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{rootCategories}</div>
            <div className="text-sm text-muted-foreground">Root Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{filteredCategories}</div>
            <div className="text-sm text-muted-foreground">
              Filtered Categories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {activeCategories}
            </div>
            <div className="text-sm text-muted-foreground">
              Active Categories
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
