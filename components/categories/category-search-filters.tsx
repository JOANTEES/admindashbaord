"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  IconSearch,
  IconSortAscending,
  IconCategory,
} from "@tabler/icons-react";

interface CategorySearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: "tree" | "flat";
  setViewMode: (mode: "tree" | "flat") => void;
}

export function CategorySearchFilters({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: CategorySearchFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search & Filter</CardTitle>
        <CardDescription>
          Find specific categories in your collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <IconSortAscending className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="name">Sort by Name</option>
              <option value="sortOrder">Sort by Order</option>
              <option value="createdAt">Sort by Date Created</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <IconCategory className="h-4 w-4" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "tree" | "flat")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="tree">Tree View</option>
              <option value="flat">Flat View</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
