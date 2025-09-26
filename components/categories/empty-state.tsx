"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCategory, IconPlus } from "@tabler/icons-react";

interface EmptyStateProps {
  searchTerm: string;
  onAddCategory: () => void;
}

export function EmptyState({ searchTerm, onAddCategory }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <IconCategory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No categories found</h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm
            ? "Try adjusting your search criteria"
            : "Add your first category to get started"}
        </p>
        {!searchTerm && (
          <Button onClick={onAddCategory}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
