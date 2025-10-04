"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
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
  IconTrash,
  IconLoader,
} from "@tabler/icons-react";
import { Product } from "@/lib/api";
import { useOptimizedApi, useOptimizedMutation } from "@/hooks/use-optimized-api";
import { ProductCardSkeleton, FormSkeleton } from "@/components/loading-skeletons";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image";

export default function ClothesOptimizedPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
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

  // Optimized API calls with caching
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useOptimizedApi<{ products?: Product[] }>('/products', {
    cacheTime: 3 * 60 * 1000, // 3 minutes
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Mutations
  const addProductMutation = useOptimizedMutation(
    '/products',
    'POST',
    {
      onSuccess: () => {
        toast.success("Product added successfully");
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
        refetchProducts();
      },
      onError: (error) => {
        toast.error(`Failed to add product: ${error}`);
      },
      invalidateQueries: ['/products']
    }
  );


  const deleteProductMutation = useOptimizedMutation(
    '/products',
    'DELETE',
    {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        refetchProducts();
      },
      onError: (error) => {
        toast.error(`Failed to delete product: ${error}`);
      },
      invalidateQueries: ['/products']
    }
  );

  // Transform data
  const products: Product[] = productsData?.products || [];

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        default:
          return 0;
      }
    });

  const handleAddProduct = async () => {
    await addProductMutation.mutate({
      name: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      size: formData.size,
      color: formData.color,
      // stock_quantity: parseInt(formData.stock), // Stock is managed through variants
      image_url: formData.imageUrl,
    });
  };


  const handleDeleteProduct = async () => {
    await deleteProductMutation.mutate();
  };


  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        Clothes Management (Optimized)
                      </h1>
                      <p className="text-muted-foreground">
                        Manage your clothing inventory with improved performance
                      </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <IconPlus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Product</DialogTitle>
                          <DialogDescription>
                            Add a new clothing item to your inventory.
                          </DialogDescription>
                        </DialogHeader>
                        {addProductMutation.isLoading ? (
                          <FormSkeleton />
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="title">Product Name</Label>
                                <Input
                                  id="title"
                                  value={formData.title}
                                  onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                  }
                                  placeholder="Enter product name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="price">Price</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  value={formData.price}
                                  onChange={(e) =>
                                    setFormData({ ...formData, price: e.target.value })
                                  }
                                  placeholder="Enter price"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Enter description"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                  id="category"
                                  value={formData.category}
                                  onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                  }
                                  placeholder="Enter category"
                                />
                              </div>
                              <div>
                                <Label htmlFor="size">Size</Label>
                                <Input
                                  id="size"
                                  value={formData.size}
                                  onChange={(e) =>
                                    setFormData({ ...formData, size: e.target.value })
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
                                    setFormData({ ...formData, color: e.target.value })
                                  }
                                  placeholder="Enter color"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input
                                  id="stock"
                                  type="number"
                                  value={formData.stock}
                                  onChange={(e) =>
                                    setFormData({ ...formData, stock: e.target.value })
                                  }
                                  placeholder="Enter stock quantity"
                                />
                              </div>
                              <div>
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                  id="imageUrl"
                                  value={formData.imageUrl}
                                  onChange={(e) =>
                                    setFormData({ ...formData, imageUrl: e.target.value })
                                  }
                                  placeholder="Enter image URL"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddProduct}
                            disabled={addProductMutation.isLoading}
                          >
                            {addProductMutation.isLoading ? (
                              <>
                                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add Product"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Filters and Search */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="shirts">Shirts</SelectItem>
                        <SelectItem value="pants">Pants</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value: "name" | "price") => setSortBy(value)}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Products Grid */}
                  {productsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : productsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 mb-4">Failed to load products: {productsError}</p>
                      <Button onClick={() => refetchProducts()}>
                        <IconLoader className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : filteredAndSortedProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No products found</p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <IconPlus className="h-4 w-4 mr-2" />
                        Add First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredAndSortedProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="aspect-square relative">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground">No Image</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-lg">${product.price}</span>
                              <Badge variant="outline">
                                Stock via variants
                              </Badge>
                            </div>
                            <div className="flex gap-1 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {product.category?.name || "No Category"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Size via variants
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Color via variants
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct()}
                                disabled={deleteProductMutation.isLoading}
                                className="text-red-500 hover:text-red-700 flex-1"
                              >
                                {deleteProductMutation.isLoading ? (
                                  <IconLoader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconTrash className="h-4 w-4" />
                                )}
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
