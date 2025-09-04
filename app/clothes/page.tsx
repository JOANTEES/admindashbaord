"use client";

import { useState, useEffect } from "react";
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
import { apiClient, Product } from "@/lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ClothesPage() {
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
    description: "",
    category: "",
    size: "",
    color: "",
    stock: "",
    imageUrl: "",
  });
  const [formFile, setFormFile] = useState<File | null>(null);

  const [editFormData, setEditFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    size: "",
    color: "",
    stock: "",
    imageUrl: "",
  });
  const [editFormFile, setEditFormFile] = useState<File | null>(null);

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getClothes();

      interface ProductsResponse {
        message: string;
        count: number;
        products: Product[];
      }

      if (response.data && (response.data as ProductsResponse).products) {
        setClothes((response.data as ProductsResponse).products);
      } else if (response.data && Array.isArray(response.data)) {
        setClothes(response.data);
      } else {
        setClothes([]);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
      toast.error("Failed to load clothes");
      setClothes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClothes = async () => {
    try {
      let imageUrl: string | undefined = formData.imageUrl || undefined;
      if (!imageUrl && formFile) {
        // Upload to Supabase Storage on submit
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
        description: formData.description,
        category: formData.category,
        size: formData.size,
        color: formData.color,
        stock: parseInt(formData.stock),
        imageUrl,
      });

      if (response.data) {
        toast.success("Clothes added successfully");
        setIsAddDialogOpen(false);
        setFormData({
          title: "",
          price: "",
          description: "",
          category: "",
          size: "",
          color: "",
          stock: "",
          imageUrl: "",
        });
        setFormFile(null);
        fetchClothes(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding clothes:", error);
      toast.error("Failed to add clothes");
    }
  };

  const handleDeleteClothes = async (id: number) => {
    try {
      await apiClient.deleteProduct(id);
      toast.success("Clothes deleted successfully");
      fetchClothes(); // Refresh the list
    } catch (error) {
      console.error("Error deleting clothes:", error);
      toast.error("Failed to delete clothes");
    }
  };

  const openEditDialog = (item: Product) => {
    setEditingProduct(item);
    setEditFormData({
      title: item.name || "",
      price: String(item.price || ""),
      description: item.description || "",
      category: item.category || "",
      size: item.size || "",
      color: item.color || "",
      stock: String(item.stock_quantity ?? ""),
      imageUrl: item.image_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClothes = async () => {
    if (!editingProduct) return;
    try {
      let imageUrl: string | undefined = editFormData.imageUrl || undefined;
      if (editFormFile) {
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
      await apiClient.updateProduct(editingProduct.id, {
        title: editFormData.title,
        price: parseFloat(editFormData.price),
        description: editFormData.description,
        category: editFormData.category,
        size: editFormData.size,
        color: editFormData.color,
        stock: parseInt(editFormData.stock),
        imageUrl,
      });
      toast.success("Clothes updated successfully");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setEditFormFile(null);
      fetchClothes();
    } catch (error) {
      console.error("Error updating clothes:", error);
      toast.error("Failed to update clothes");
    }
  };

  // Filter and sort clothes
  const filteredAndSortedClothes = clothes
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return parseFloat(a.price) - parseFloat(b.price);
        case "stock":
          return a.stock_quantity - b.stock_quantity;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const totalValue = filteredAndSortedClothes.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.stock_quantity,
    0
  );

  const categories = Array.from(new Set(clothes.map((item) => item.category)));

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
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={formData.category}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  category: e.target.value,
                                })
                              }
                              placeholder="Enter category"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="size">Size</Label>
                              <Input
                                id="size"
                                value={formData.size}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    size: e.target.value,
                                  })
                                }
                                placeholder="Enter size"
                              />
                            </div>
                            <div>
                              <Label htmlFor="color">Color</Label>
                              <Input
                                id="color"
                                value={formData.color}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    color: e.target.value,
                                  })
                                }
                                placeholder="Enter color"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={formData.stock}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stock: e.target.value,
                                })
                              }
                              placeholder="Enter stock quantity"
                            />
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
                          <Button onClick={handleAddClothes}>
                            Add Clothes
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
                          <div>
                            <Label htmlFor="edit_category">Category</Label>
                            <Input
                              id="edit_category"
                              value={editFormData.category}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  category: e.target.value,
                                })
                              }
                              placeholder="Enter category"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit_size">Size</Label>
                              <Input
                                id="edit_size"
                                value={editFormData.size}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    size: e.target.value,
                                  })
                                }
                                placeholder="Enter size"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit_color">Color</Label>
                              <Input
                                id="edit_color"
                                value={editFormData.color}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    color: e.target.value,
                                  })
                                }
                                placeholder="Enter color"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="edit_stock">Stock Quantity</Label>
                            <Input
                              id="edit_stock"
                              type="number"
                              value={editFormData.stock}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  stock: e.target.value,
                                })
                              }
                              placeholder="Enter stock quantity"
                            />
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
                          <Button onClick={handleUpdateClothes}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stats Card */}
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {clothes.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Items
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {filteredAndSortedClothes.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Filtered Items
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            ₵{totalValue.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Value
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
                            <span className="text-lg font-bold text-primary">
                              ₵{item.price}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.size}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.color}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Stock: {item.stock_quantity}
                            </span>
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
                                className="text-red-500 hover:text-red-700"
                              >
                                <IconTrash className="h-4 w-4" />
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
  /* eslint-disable @typescript-eslint/no-unused-vars */
}
{
  /* The dialog is controlled by isEditDialogOpen and editingProduct state above */
}
{
  /* Render at root under ProtectedRoute to avoid layout clipping */
}
