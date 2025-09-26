"use client";

import { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconPlus, IconLoader } from "@tabler/icons-react";
import { apiClient, Category, CategoriesResponse } from "@/lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import {
  CategoryStats,
  CategorySearchFilters,
  CategoryForm,
  CategoryTree,
  CategoryGrid,
  EmptyState,
} from "@/components/categories";

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  imageUrl: string;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  // Helper function to flatten tree structure
  const flattenCategories = (categories: Category[]): Category[] => {
    const flattened: Category[] = [];

    const flatten = (cats: Category[]) => {
      cats.forEach((cat) => {
        flattened.push(cat);
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      });
    };

    flatten(categories);
    return flattened;
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const [treeResponse, flatResponse] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getCategoriesFlat(),
      ]);

      // Handle tree response (nested structure)
      if (
        treeResponse.data &&
        (treeResponse.data as CategoriesResponse).categories
      ) {
        const categoriesData = (treeResponse.data as CategoriesResponse)
          .categories;
        // Flatten the tree to get all categories
        const allCategories = flattenCategories(categoriesData);

        setCategories(allCategories);
      } else if (treeResponse.data && Array.isArray(treeResponse.data)) {
        console.log("Loaded categories (array):", treeResponse.data);
        setCategories(treeResponse.data);
      } else {
        setCategories([]);
      }

      // Handle flat response
      if (
        flatResponse.data &&
        (flatResponse.data as CategoriesResponse).categories
      ) {
        setFlatCategories((flatResponse.data as CategoriesResponse).categories);
      } else if (flatResponse.data && Array.isArray(flatResponse.data)) {
        setFlatCategories(flatResponse.data);
      } else {
        setFlatCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
      setFlatCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (formData: CategoryFormData) => {
    try {
      setIsAddingCategory(true);
      const response = await apiClient.createCategory({
        name: formData.name,
        description: formData.description || undefined,
        parent_id:
          formData.parentId && formData.parentId !== "none"
            ? parseInt(formData.parentId)
            : undefined,
        image_url: formData.imageUrl || undefined,
        sort_order: formData.sortOrder,
      });

      const possibleError = (response as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }

      if (response.data) {
        toast.success("Category created successfully");
        setIsAddDialogOpen(false);
        fetchCategories(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setIsDeletingCategory(id);
      const resp = await apiClient.deleteCategory(id);
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }
      toast.success("Category deleted successfully");
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setIsDeletingCategory(null);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async (formData: CategoryFormData) => {
    if (!editingCategory) return;
    try {
      setIsUpdatingCategory(true);
      const resp = await apiClient.updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description || undefined,
        parent_id:
          formData.parentId && formData.parentId !== "none"
            ? parseInt(formData.parentId)
            : undefined,
        image_url: formData.imageUrl || undefined,
        sort_order: formData.sortOrder,
      });
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }
      toast.success("Category updated successfully");
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getRootCategories = useMemo(() => {
    return categories.filter(
      (cat) => !cat.parentId || cat.parentId === null || cat.parentId === ""
    );
  }, [categories]);

  const getChildCategories = (parentId: string) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    const sourceCategories =
      viewMode === "tree" ? getRootCategories : flatCategories;
    return sourceCategories
      .filter((category) => {
        const matchesSearch =
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "sortOrder":
            return a.sortOrder - b.sortOrder;
          case "createdAt":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          default:
            return 0;
        }
      });
  }, [viewMode, getRootCategories, flatCategories, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-center h-64">
                      <div className="flex items-center gap-2">
                        <IconLoader className="h-6 w-6 animate-spin" />
                        <span>Loading categories...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        Category Management
                      </h1>
                      <p className="text-muted-foreground">
                        Manage hierarchical product categories
                      </p>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <IconPlus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>

                  <CategoryStats
                    totalCategories={flatCategories.length}
                    rootCategories={getRootCategories.length}
                    filteredCategories={filteredAndSortedCategories.length}
                    activeCategories={
                      flatCategories.filter((cat) => cat.isActive).length
                    }
                  />

                  <CategorySearchFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />

                  {viewMode === "tree" ? (
                    <CategoryTree
                      categories={filteredAndSortedCategories}
                      expandedCategories={expandedCategories}
                      onToggleExpanded={toggleExpanded}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteCategory}
                      isDeleting={isDeletingCategory}
                      getChildCategories={getChildCategories}
                    />
                  ) : (
                    <CategoryGrid
                      categories={filteredAndSortedCategories}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteCategory}
                      isDeleting={isDeletingCategory}
                    />
                  )}

                  {filteredAndSortedCategories.length === 0 && (
                    <EmptyState
                      searchTerm={searchTerm}
                      onAddCategory={() => setIsAddDialogOpen(true)}
                    />
                  )}

                  <CategoryForm
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onSubmit={handleAddCategory}
                    isLoading={isAddingCategory}
                    title="Add New Category"
                    description="Create a new category for your products."
                    submitText="Create Category"
                    flatCategories={flatCategories}
                  />

                  <CategoryForm
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                    onSubmit={handleUpdateCategory}
                    isLoading={isUpdatingCategory}
                    title="Edit Category"
                    description="Update category information and save changes."
                    submitText="Update Category"
                    initialData={
                      editingCategory
                        ? {
                            name: editingCategory.name || "",
                            description: editingCategory.description || "",
                            parentId: editingCategory.parentId || "none",
                            imageUrl: editingCategory.imageUrl || "",
                            sortOrder: editingCategory.sortOrder || 0,
                          }
                        : undefined
                    }
                    flatCategories={flatCategories}
                    editingCategory={editingCategory}
                  />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
