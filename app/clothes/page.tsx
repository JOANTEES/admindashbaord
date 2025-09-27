"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconTrash,
  IconEdit,
  IconLoader,
} from "@tabler/icons-react";
import {
  apiClient,
  Product,
  Brand,
  Category,
  ProductsResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ClothesPage() {
  const router = useRouter();
  const [clothes, setClothes] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    costPrice: "",
    discountPrice: "",
    discountPercent: "",
    brandId: "",
    categoryId: "",
    sku: "",
    description: "",
    category: "",
    size: "",
    color: "",
    stock: "",
    imageUrl: "",
    requiresSpecialDelivery: false,
    deliveryEligible: true,
    pickupEligible: true,
  });
  const [formFile, setFormFile] = useState<File | null>(null);
  const [isAddingClothes, setIsAddingClothes] = useState(false);
  const [isUpdatingClothes, setIsUpdatingClothes] = useState(false);
  const [isDeletingClothes, setIsDeletingClothes] = useState<number | null>(
    null
  );

  const [editFormData, setEditFormData] = useState({
    title: "",
    price: "",
    costPrice: "",
    discountPrice: "",
    discountPercent: "",
    brandId: "",
    categoryId: "",
    sku: "",
    description: "",
    category: "",
    size: "",
    color: "",
    stock: "",
    imageUrl: "",
    requiresSpecialDelivery: false,
    deliveryEligible: true,
    pickupEligible: true,
  });
  const [editFormFile, setEditFormFile] = useState<File | null>(null);

  useEffect(() => {
    fetchClothes();
    fetchBrandsAndCategories();
  }, []);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categoriesFlat, setCategoriesFlat] = useState<Category[]>([]);
  const [inventorySummary, setInventorySummary] = useState<{
    totalInventoryValue: number;
    totalItemsInStock: number;
    totalVariants: number;
  } | null>(null);

  // Build hierarchical labels for categories (e.g., "Men's Clothing / T-Shirts")
  const categoryById = useMemo(() => {
    const m = new Map<string, Category>();
    categoriesFlat.forEach((c) => m.set(c.id, c));
    return m;
  }, [categoriesFlat]);

  const categoryOptions = useMemo(() => {
    // Build a set of category ids that are referenced as a parentId by others
    const parentIdsWithChildren = new Set<string>();
    for (const cat of categoriesFlat) {
      if (cat.parentId) parentIdsWithChildren.add(cat.parentId);
    }

    // Only include leaf categories (those that are not parents)
    const leaves = categoriesFlat.filter(
      (c) => !parentIdsWithChildren.has(c.id)
    );

    const options = leaves.map((c) => {
      const names: string[] = [c.name];
      let current: Category | undefined = c;
      while (current && current.parentId) {
        const parent = categoryById.get(current.parentId);
        if (!parent) break;
        names.unshift(parent.name);
        current = parent;
      }
      return {
        id: c.id,
        label: names.join(" / "),
        depth: names.length - 1,
      };
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [categoriesFlat, categoryById]);

  const computeEffectivePrice = (
    priceStr: string,
    discountPriceStr: string,
    discountPercentStr: string
  ) => {
    const price = parseFloat(priceStr || "0");
    const discountPrice = parseFloat(discountPriceStr || "0");
    const discountPercent = parseFloat(discountPercentStr || "0");
    if (!isNaN(discountPrice) && discountPrice > 0 && discountPrice < price) {
      return discountPrice;
    }
    if (!isNaN(discountPercent) && discountPercent > 0) {
      return price - (price * discountPercent) / 100;
    }
    return price;
  };

  const computeProfit = (
    costPriceStr: string,
    effectivePrice: number
  ): { profit: number; margin: number } | null => {
    const cost = parseFloat(costPriceStr || "");
    if (isNaN(cost) || cost <= 0) return null;
    const profit = effectivePrice - cost;
    const margin = effectivePrice > 0 ? (profit / effectivePrice) * 100 : 0;
    return { profit, margin };
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const [b, c] = await Promise.all([
        apiClient.getBrands(),
        apiClient.getCategoriesFlat(),
      ]);
      const brandsData = (b.data as { brands?: Brand[]; data?: unknown })
        .brands;
      const catsData = (c.data as { categories?: Category[]; data?: unknown })
        .categories;
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setCategoriesFlat(Array.isArray(catsData) ? catsData : []);
    } catch {
      // non-fatal
    }
  };

  // Function to build full category path
  const getCategoryPath = (
    category: string | { id: string; name: string } | undefined
  ): string => {
    if (typeof category === "string") {
      return category;
    }
    if (!category?.id) {
      return "Uncategorized";
    }

    // Get the full category data from our categoriesFlat array
    // because the product's category object might be incomplete
    const fullCategory = categoryById.get(category.id);
    if (!fullCategory) {
      return category.name; // Fallback to just the name
    }

    const names: string[] = [fullCategory.name];
    let current = fullCategory;

    // Walk up the parent chain using the full category data
    while (current.parentId) {
      const parent = categoryById.get(current.parentId);
      if (!parent) break;
      names.unshift(parent.name);
      current = parent;
    }

    return names.join(" / ");
  };

  const fetchClothes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProducts();

      if (response.data && (response.data as ProductsResponse).products) {
        const data = response.data as ProductsResponse;
        setClothes(data.products);
        setInventorySummary(data.inventorySummary);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for old response format
        setClothes(response.data);
        setInventorySummary(null);
      } else {
        setClothes([]);
        setInventorySummary(null);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
      toast.error("Failed to load clothes");
      setClothes([]);
      setInventorySummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClothes = async () => {
    try {
      setIsAddingClothes(true);
      let imageUrl: string | undefined = formData.imageUrl || undefined;
      if (!imageUrl && formFile) {
        // Upload to Supabase Storage on submit
        if (!supabase) {
          toast.error("Image upload not available - Supabase not configured");
          return;
        }
        const ext = formFile.name.split(".").pop() || "jpg";
        const path = `images/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, formFile, { contentType: formFile.type });
        if (uploadError) {
          toast.error("Image upload failed");
          return;
        }
        const { data } = supabase.storage.from("products").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
      // If user pasted a URL, use it; otherwise, if a File was in imageUrl (not in current form), skip.
      // For now we keep URL-only to minimize UI churn. We can add <input type="file"> next.

      const response = await apiClient.addClothes({
        title: formData.title,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : undefined,
        discountPercent: formData.discountPercent
          ? parseFloat(formData.discountPercent)
          : undefined,
        brandId: formData.brandId || undefined,
        categoryId: formData.categoryId || undefined,
        sku: formData.sku || undefined,
        description: formData.description,
        // legacy simple fields kept
        category: formData.category,
        size: formData.size,
        color: formData.color,
        stock: parseInt(formData.stock) || 0,
        imageUrl,
        requiresSpecialDelivery: formData.requiresSpecialDelivery,
        deliveryEligible: formData.deliveryEligible,
        pickupEligible: formData.pickupEligible,
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
        toast.success("Clothes added successfully");
        setIsAddDialogOpen(false);
        setFormData({
          title: "",
          price: "",
          costPrice: "",
          discountPrice: "",
          discountPercent: "",
          brandId: "",
          categoryId: "",
          sku: "",
          description: "",
          category: "",
          size: "",
          color: "",
          stock: "",
          imageUrl: "",
          requiresSpecialDelivery: false,
          deliveryEligible: true,
          pickupEligible: true,
        });
        setFormFile(null);
        fetchClothes(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding clothes:", error);
      toast.error("Failed to add clothes");
    } finally {
      setIsAddingClothes(false);
    }
  };

  const handleDeleteClothes = async (id: number) => {
    try {
      setIsDeletingClothes(id);
      const resp = await apiClient.deleteProduct(id);
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }
      toast.success("Clothes deleted successfully");
      fetchClothes(); // Refresh the list
    } catch (error) {
      console.error("Error deleting clothes:", error);
      toast.error("Failed to delete clothes");
    } finally {
      setIsDeletingClothes(null);
    }
  };

  const openEditDialog = (item: Product) => {
    setEditingProduct(item);
    setEditFormData({
      title: item.name || "",
      price: String(item.price || ""),
      costPrice: item.costPrice !== undefined ? String(item.costPrice) : "",
      discountPrice:
        item.discountPrice !== undefined ? String(item.discountPrice) : "",
      discountPercent:
        item.discountPercent !== undefined ? String(item.discountPercent) : "",
      brandId: item.brand?.id || "",
      categoryId: item.category?.id || "",
      sku: item.sku || "",
      description: item.description || "",
      category:
        typeof item.category === "string"
          ? item.category
          : item.category?.name || "",
      size: "",
      color: "",
      stock: "0",
      imageUrl: item.image_url || "",
      requiresSpecialDelivery: item.requires_special_delivery || false,
      deliveryEligible:
        item.delivery_eligible !== undefined ? item.delivery_eligible : true,
      pickupEligible:
        item.pickup_eligible !== undefined ? item.pickup_eligible : true,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClothes = async () => {
    if (!editingProduct) return;
    try {
      setIsUpdatingClothes(true);
      let imageUrl: string | undefined = editFormData.imageUrl || undefined;
      if (editFormFile) {
        if (!supabase) {
          toast.error("Image upload not available - Supabase not configured");
          return;
        }
        const ext = editFormFile.name.split(".").pop() || "jpg";
        const path = `images/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, editFormFile, { contentType: editFormFile.type });
        if (uploadError) {
          toast.error("Image upload failed");
          return;
        }
        const { data } = supabase.storage.from("products").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
      const resp = await apiClient.updateProduct(editingProduct.id, {
        title: editFormData.title,
        price: parseFloat(editFormData.price),
        costPrice: editFormData.costPrice
          ? parseFloat(editFormData.costPrice)
          : undefined,
        discountPrice: editFormData.discountPrice
          ? parseFloat(editFormData.discountPrice)
          : undefined,
        discountPercent: editFormData.discountPercent
          ? parseFloat(editFormData.discountPercent)
          : undefined,
        brandId: editFormData.brandId || undefined,
        categoryId: editFormData.categoryId || undefined,
        sku: editFormData.sku || undefined,
        description: editFormData.description,
        category: editFormData.category,
        size: editFormData.size,
        color: editFormData.color,
        stock: parseInt(editFormData.stock) || 0,
        imageUrl,
        requiresSpecialDelivery: editFormData.requiresSpecialDelivery,
        deliveryEligible: editFormData.deliveryEligible,
        pickupEligible: editFormData.pickupEligible,
      });
      const possibleError2 = (resp as unknown as { error?: string }).error;
      if (possibleError2) {
        let message = possibleError2;
        try {
          const parsed = JSON.parse(possibleError2) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }
      toast.success("Clothes updated successfully");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setEditFormFile(null);
      fetchClothes();
    } catch (error) {
      console.error("Error updating clothes:", error);
      toast.error("Failed to update clothes");
    } finally {
      setIsUpdatingClothes(false);
    }
  };

  // Filter and sort clothes
  const filteredAndSortedClothes = clothes
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const itemCategoryName = getCategoryPath(item.category);
      const matchesCategory =
        filterCategory === "all" || itemCategoryName === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return (a.effectivePrice || a.price) - (b.effectivePrice || b.price);
        case "stock":
          // Stock is now managed per variant, so we can't sort by stock here
          return 0;
        case "category": {
          const aCat = getCategoryPath(a.category);
          const bCat = getCategoryPath(b.category);
          return aCat.localeCompare(bCat);
        }
        default:
          return 0;
      }
    });

  // Use backend-provided inventory value instead of manual calculation
  const totalValue = inventorySummary?.totalInventoryValue || 0;

  const categories = Array.from(
    new Set(clothes.map((item) => getCategoryPath(item.category)))
  );

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
                        <span>Loading clothes...</span>
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
                        Clothes Management
                      </h1>
                      <p className="text-muted-foreground">
                        Manage your clothing inventory
                      </p>
                    </div>
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <IconPlus className="h-4 w-4 mr-2" />
                          Add Clothes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Clothes</DialogTitle>
                          <DialogDescription>
                            Add a new clothing item to your inventory.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Name</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Enter clothes name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Price (₵)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: e.target.value,
                                })
                              }
                              placeholder="Enter price"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="costPrice">Cost Price (₵)</Label>
                              <Input
                                id="costPrice"
                                type="number"
                                step="0.01"
                                value={formData.costPrice}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    costPrice: e.target.value,
                                  })
                                }
                                placeholder="Enter cost price"
                              />
                            </div>
                            <div>
                              <Label htmlFor="discountPrice">
                                Discount Price (₵)
                              </Label>
                              <Input
                                id="discountPrice"
                                type="number"
                                step="0.01"
                                value={formData.discountPrice}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    discountPrice: e.target.value,
                                  })
                                }
                                placeholder="Enter discount price"
                              />
                            </div>
                            <div>
                              <Label htmlFor="discountPercent">
                                Discount %
                              </Label>
                              <Input
                                id="discountPercent"
                                type="number"
                                step="0.01"
                                value={formData.discountPercent}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    discountPercent: e.target.value,
                                  })
                                }
                                placeholder="Enter discount percent"
                              />
                            </div>
                          </div>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">
                                Effective Price
                              </div>
                              <div className="text-2xl font-bold">
                                ₵
                                {computeEffectivePrice(
                                  formData.price,
                                  formData.discountPrice,
                                  formData.discountPercent
                                ).toFixed(2)}
                              </div>
                              {(() => {
                                const eff = computeEffectivePrice(
                                  formData.price,
                                  formData.discountPrice,
                                  formData.discountPercent
                                );
                                const p = computeProfit(
                                  formData.costPrice,
                                  eff
                                );
                                if (!p) return null;
                                return (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Profit: ₵{p.profit.toFixed(2)} · Margin:{" "}
                                    {p.margin.toFixed(1)}%
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="brandId">Brand</Label>
                              <Select
                                value={formData.brandId}
                                onValueChange={(v) =>
                                  setFormData({ ...formData, brandId: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                                <SelectContent>
                                  {brands.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                      {b.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="categoryId">Category</Label>
                              <Select
                                value={formData.categoryId}
                                onValueChange={(v) =>
                                  setFormData({ ...formData, categoryId: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categoryOptions.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                              id="sku"
                              value={formData.sku}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  sku: e.target.value,
                                })
                              }
                              placeholder="Enter SKU (optional)"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Enter description"
                            />
                          </div>
                          {/* remove legacy free-text category (using dropdown above) */}
                          {/* remove legacy size/color from base form; handled via variants */}
                          {/* Stock quantity removed - now managed per variant */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="requiresSpecialDelivery"
                              checked={formData.requiresSpecialDelivery}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  requiresSpecialDelivery: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label
                              htmlFor="requiresSpecialDelivery"
                              className="text-sm"
                            >
                              Requires Special Delivery
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="deliveryEligible"
                              checked={formData.deliveryEligible}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  deliveryEligible: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label
                              htmlFor="deliveryEligible"
                              className="text-sm"
                            >
                              Can Be Delivered
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="pickupEligible"
                              checked={formData.pickupEligible}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  pickupEligible: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label htmlFor="pickupEligible" className="text-sm">
                              Can Be Picked Up
                            </Label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="imageUrl">
                                Image URL (Optional)
                              </Label>
                              <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    imageUrl: e.target.value,
                                  })
                                }
                                placeholder="Enter image URL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="imageFile">Or Select Image</Label>
                              <Input
                                id="imageFile"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setFormFile(e.target.files?.[0] || null)
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddClothes}
                            disabled={
                              isAddingClothes ||
                              (formData.discountPrice !== "" &&
                                parseFloat(formData.discountPrice) >=
                                  parseFloat(formData.price || "0")) ||
                              (formData.discountPercent !== "" &&
                                (parseFloat(formData.discountPercent) < 0 ||
                                  parseFloat(formData.discountPercent) > 100))
                            }
                          >
                            {isAddingClothes ? (
                              <>
                                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add Clothes"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {/* Edit Clothes Dialog */}
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Clothes</DialogTitle>
                          <DialogDescription>
                            Update product details and save changes.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit_title">Name</Label>
                            <Input
                              id="edit_title"
                              value={editFormData.title}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Enter clothes name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_price">Price (₵)</Label>
                            <Input
                              id="edit_price"
                              type="number"
                              step="0.01"
                              value={editFormData.price}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  price: e.target.value,
                                })
                              }
                              placeholder="Enter price"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="edit_costPrice">
                                Cost Price (₵)
                              </Label>
                              <Input
                                id="edit_costPrice"
                                type="number"
                                step="0.01"
                                value={editFormData.costPrice}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    costPrice: e.target.value,
                                  })
                                }
                                placeholder="Enter cost price"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit_discountPrice">
                                Discount Price (₵)
                              </Label>
                              <Input
                                id="edit_discountPrice"
                                type="number"
                                step="0.01"
                                value={editFormData.discountPrice}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    discountPrice: e.target.value,
                                  })
                                }
                                placeholder="Enter discount price"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit_discountPercent">
                                Discount %
                              </Label>
                              <Input
                                id="edit_discountPercent"
                                type="number"
                                step="0.01"
                                value={editFormData.discountPercent}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    discountPercent: e.target.value,
                                  })
                                }
                                placeholder="Enter discount percent"
                              />
                            </div>
                          </div>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">
                                Effective Price
                              </div>
                              <div className="text-2xl font-bold">
                                ₵
                                {computeEffectivePrice(
                                  editFormData.price,
                                  editFormData.discountPrice,
                                  editFormData.discountPercent
                                ).toFixed(2)}
                              </div>
                              {(() => {
                                const eff = computeEffectivePrice(
                                  editFormData.price,
                                  editFormData.discountPrice,
                                  editFormData.discountPercent
                                );
                                const p = computeProfit(
                                  editFormData.costPrice,
                                  eff
                                );
                                if (!p) return null;
                                return (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Profit: ₵{p.profit.toFixed(2)} · Margin:{" "}
                                    {p.margin.toFixed(1)}%
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit_brandId">Brand</Label>
                              <Select
                                value={editFormData.brandId}
                                onValueChange={(v) =>
                                  setEditFormData({
                                    ...editFormData,
                                    brandId: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                                <SelectContent>
                                  {brands.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                      {b.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit_categoryId">Category</Label>
                              <Select
                                value={editFormData.categoryId}
                                onValueChange={(v) =>
                                  setEditFormData({
                                    ...editFormData,
                                    categoryId: v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categoryOptions.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="edit_sku">SKU</Label>
                            <Input
                              id="edit_sku"
                              value={editFormData.sku}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  sku: e.target.value,
                                })
                              }
                              placeholder="Enter SKU (optional)"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_description">
                              Description
                            </Label>
                            <Input
                              id="edit_description"
                              value={editFormData.description}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Enter description"
                            />
                          </div>
                          {/* remove legacy free-text category */}
                          {/* remove legacy size/color; managed in variants */}
                          {/* Stock quantity removed - now managed per variant */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="edit_requiresSpecialDelivery"
                              checked={editFormData.requiresSpecialDelivery}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  requiresSpecialDelivery: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label
                              htmlFor="edit_requiresSpecialDelivery"
                              className="text-sm"
                            >
                              Requires Special Delivery
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="edit_deliveryEligible"
                              checked={editFormData.deliveryEligible}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  deliveryEligible: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label
                              htmlFor="edit_deliveryEligible"
                              className="text-sm"
                            >
                              Can Be Delivered
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="edit_pickupEligible"
                              checked={editFormData.pickupEligible}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  pickupEligible: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label
                              htmlFor="edit_pickupEligible"
                              className="text-sm"
                            >
                              Can Be Picked Up
                            </Label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit_imageUrl">
                                Image URL (Optional)
                              </Label>
                              <Input
                                id="edit_imageUrl"
                                value={editFormData.imageUrl}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    imageUrl: e.target.value,
                                  })
                                }
                                placeholder="Enter image URL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit_imageFile">
                                Or Select Image
                              </Label>
                              <Input
                                id="edit_imageFile"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setEditFormFile(e.target.files?.[0] || null)
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateClothes}
                            disabled={
                              isUpdatingClothes ||
                              (editFormData.discountPrice !== "" &&
                                parseFloat(editFormData.discountPrice) >=
                                  parseFloat(editFormData.price || "0")) ||
                              (editFormData.discountPercent !== "" &&
                                (parseFloat(editFormData.discountPercent) < 0 ||
                                  parseFloat(editFormData.discountPercent) >
                                    100))
                            }
                          >
                            {isUpdatingClothes ? (
                              <>
                                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stats Card */}
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {clothes.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Products
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {filteredAndSortedClothes.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Filtered Products
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">
                            {inventorySummary?.totalItemsInStock || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Items in Stock
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            ₵{totalValue.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Inventory Value
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search and Filter */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Search & Filter</CardTitle>
                      <CardDescription>
                        Find specific clothes in your inventory
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search clothes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select
                          value={filterCategory}
                          onValueChange={setFilterCategory}
                        >
                          <SelectTrigger>
                            <IconFilter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <IconSortAscending className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="stock">Stock</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Clothes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedClothes.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-square relative bg-muted">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <IconEdit className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {item.name}
                            </h3>
                            <div className="text-right">
                              <span className="text-lg font-bold text-primary">
                                ₵{item.effectivePrice || item.price}
                              </span>
                              {item.effectivePrice &&
                                item.effectivePrice < item.price && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    ₵{item.price}
                                  </div>
                                )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {/* Brand Badge */}
                            {item.brand && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {item.brand.name}
                              </Badge>
                            )}
                            {/* Category Badge - Show hierarchical name */}
                            <Badge variant="outline" className="text-xs">
                              {getCategoryPath(item.category)}
                            </Badge>
                            {/* Delivery/Pickup Badges */}
                            <div className="flex flex-wrap gap-1">
                              {item.requires_special_delivery && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                                >
                                  Special Delivery
                                </Badge>
                              )}
                              {!item.delivery_eligible && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-100 text-red-700 border-red-200"
                                >
                                  No Delivery
                                </Badge>
                              )}
                              {!item.pickup_eligible && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-100 text-red-700 border-red-200"
                                >
                                  No Pickup
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  router.push(`/products/${item.id}/variants`);
                                }}
                              >
                                Manage Variants
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(item)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClothes(item.id)}
                                disabled={isDeletingClothes === item.id}
                                className="text-red-500 hover:text-red-700"
                              >
                                {isDeletingClothes === item.id ? (
                                  <IconLoader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconTrash className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredAndSortedClothes.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <IconEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No clothes found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm || filterCategory !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Add your first clothing item to get started"}
                        </p>
                        {!searchTerm && filterCategory === "all" && (
                          <Button onClick={() => setIsAddDialogOpen(true)}>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add Clothes
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

// Edit Dialog markup (placed near end for readability)
// Note: Using existing Dialog components
// Inject after the main return content if needed; for now, include below to keep file cohesive

/* Edit Dialog */
{
  /* The dialog is controlled by isEditDialogOpen and editingProduct state above */
}
{
  /* Render at root under ProtectedRoute to avoid layout clipping */
}
