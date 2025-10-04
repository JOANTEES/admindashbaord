"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconLoader,
  IconPackage,
  IconAlertCircle,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Using simple Dialog for confirmation instead of AlertDialog
import { ProtectedRoute } from "@/components/protected-route";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { apiClient } from "@/lib/api";
import type { ProductVariant, ProductVariantsResponse } from "@/lib/api";

interface VariantFormData {
  sku: string;
  size: string;
  color: string;
  stockQuantity: string;
  imageUrl: string;
}

export default function ProductVariantsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [product, setProduct] = useState<{ id: string; name: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<VariantFormData>({
    sku: "",
    size: "",
    color: "",
    stockQuantity: "",
    imageUrl: "",
  });

  const [editFormData, setEditFormData] = useState<VariantFormData>({
    sku: "",
    size: "",
    color: "",
    stockQuantity: "",
    imageUrl: "",
  });

  // Load variants
  const fetchVariants = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProductVariants(productId);
      const data = response.data as ProductVariantsResponse;

      if (data.success) {
        setVariants(data.variants || []);
        setProduct(data.product);
      } else {
        throw new Error(data.message || "Failed to load variants");
      }
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error("Failed to load variants");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [productId, fetchVariants]);

  // Calculate total stock
  const totalStock = variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0
  );
  const activeVariants = variants.filter((v) => v.isActive).length;

  // Add variant
  const handleAddVariant = async () => {
    try {
      setIsCreating(true);

      const response = await apiClient.createVariant({
        product_id: parseInt(productId),
        sku: formData.sku || undefined,
        size: formData.size || undefined,
        color: formData.color || undefined,
        stock_quantity: parseInt(formData.stockQuantity),
        image_url: formData.imageUrl || undefined,
      });

      const data = response.data as { success: boolean; message: string };
      if (data.success) {
        toast.success("Variant created successfully");
        setIsAddDialogOpen(false);
        setFormData({
          sku: "",
          size: "",
          color: "",
          stockQuantity: "",
          imageUrl: "",
        });
        fetchVariants();
      } else {
        throw new Error(data.message || "Failed to create variant");
      }
    } catch (error) {
      console.error("Error creating variant:", error);
      toast.error("Failed to create variant");
    } finally {
      setIsCreating(false);
    }
  };

  // Edit variant
  const openEditDialog = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setEditFormData({
      sku: variant.sku || "",
      size: variant.size || "",
      color: variant.color || "",
      stockQuantity: variant.stockQuantity.toString(),
      imageUrl: variant.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateVariant = async () => {
    if (!editingVariant) return;

    try {
      setIsUpdating(true);

      const response = await apiClient.updateVariant(editingVariant.id, {
        sku: editFormData.sku || undefined,
        size: editFormData.size || undefined,
        color: editFormData.color || undefined,
        stock_quantity: parseInt(editFormData.stockQuantity),
        image_url: editFormData.imageUrl || undefined,
      });

      const data = response.data as { success: boolean; message: string };
      if (data.success) {
        toast.success("Variant updated successfully");
        setIsEditDialogOpen(false);
        setEditingVariant(null);
        fetchVariants();
      } else {
        throw new Error(data.message || "Failed to update variant");
      }
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error("Failed to update variant");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete variant
  const handleDeleteVariant = async () => {
    if (!variantToDelete) return;

    try {
      setIsDeleting(variantToDelete);

      const response = await apiClient.deleteVariant(variantToDelete);
      const data = response.data as { success: boolean; message: string };

      if (data.success) {
        toast.success("Variant deleted successfully");
        setDeleteDialogOpen(false);
        setVariantToDelete(null);
        fetchVariants();
      } else {
        throw new Error(data.message || "Failed to delete variant");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    } finally {
      setIsDeleting(null);
    }
  };

  const openDeleteDialog = (variantId: string) => {
    setVariantToDelete(variantId);
    setDeleteDialogOpen(true);
  };

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
                        <span>Loading variants...</span>
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
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                      >
                        <IconArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">
                          {product?.name} - Variants
                        </h1>
                        <p className="text-muted-foreground">
                          Manage product variants and stock levels
                        </p>
                      </div>
                    </div>
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <IconPlus className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Variant</DialogTitle>
                          <DialogDescription>
                            Create a new variant for this product.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="sku">SKU (Optional)</Label>
                            <Input
                              id="sku"
                              value={formData.sku}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  sku: e.target.value,
                                })
                              }
                              placeholder="Enter SKU"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="size">Size (Optional)</Label>
                              <Input
                                id="size"
                                value={formData.size}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    size: e.target.value,
                                  })
                                }
                                placeholder="e.g., M, L, XL"
                              />
                            </div>
                            <div>
                              <Label htmlFor="color">Color (Optional)</Label>
                              <Input
                                id="color"
                                value={formData.color}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    color: e.target.value,
                                  })
                                }
                                placeholder="e.g., Red, Blue"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="stockQuantity">
                              Stock Quantity *
                            </Label>
                            <Input
                              id="stockQuantity"
                              type="number"
                              min="0"
                              value={formData.stockQuantity}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stockQuantity: e.target.value,
                                })
                              }
                              placeholder="Enter stock quantity"
                              required
                            />
                          </div>
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
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsAddDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddVariant}
                              disabled={isCreating || !formData.stockQuantity}
                            >
                              {isCreating ? (
                                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Add Variant
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <IconPackage className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Total Variants
                            </div>
                            <div className="text-2xl font-bold">
                              {variants.length}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <IconAlertCircle className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Active Variants
                            </div>
                            <div className="text-2xl font-bold">
                              {activeVariants}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <IconPackage className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Total Stock
                            </div>
                            <div className="text-2xl font-bold">
                              {totalStock}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Variants List */}
                  <div className="space-y-4">
                    {variants.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-12">
                          <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No variants found
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Create your first variant to get started
                          </p>
                          <Button onClick={() => setIsAddDialogOpen(true)}>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add First Variant
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {variants.map((variant) => (
                          <Card key={variant.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-sm">
                                    {variant.size && variant.color
                                      ? `${variant.size} - ${variant.color}`
                                      : variant.size ||
                                        variant.color ||
                                        "Default"}
                                  </h3>
                                  {variant.sku && (
                                    <p className="text-xs text-muted-foreground">
                                      SKU: {variant.sku}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant={
                                    variant.isActive ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {variant.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>

                              <div className="mb-3">
                                <div className="text-sm text-muted-foreground">
                                  Stock
                                </div>
                                <div className="text-lg font-bold">
                                  {variant.stockQuantity}
                                </div>
                              </div>

                              {variant.imageUrl && (
                                <div className="mb-3">
                                  <Image
                                    src={variant.imageUrl}
                                    alt={`${variant.size} ${variant.color}`}
                                    width={200}
                                    height={80}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                </div>
                              )}

                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(variant)}
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => openDeleteDialog(variant.id)}
                                >
                                  {isDeleting === variant.id ? (
                                    <IconLoader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <IconTrash className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit Dialog */}
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Variant</DialogTitle>
                        <DialogDescription>
                          Update variant details and stock quantity.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit_sku">SKU (Optional)</Label>
                          <Input
                            id="edit_sku"
                            value={editFormData.sku}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                sku: e.target.value,
                              })
                            }
                            placeholder="Enter SKU"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit_size">Size (Optional)</Label>
                            <Input
                              id="edit_size"
                              value={editFormData.size}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  size: e.target.value,
                                })
                              }
                              placeholder="e.g., M, L, XL"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_color">Color (Optional)</Label>
                            <Input
                              id="edit_color"
                              value={editFormData.color}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  color: e.target.value,
                                })
                              }
                              placeholder="e.g., Red, Blue"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="edit_stockQuantity">
                            Stock Quantity *
                          </Label>
                          <Input
                            id="edit_stockQuantity"
                            type="number"
                            min="0"
                            value={editFormData.stockQuantity}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                stockQuantity: e.target.value,
                              })
                            }
                            placeholder="Enter stock quantity"
                            required
                          />
                        </div>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateVariant}
                            disabled={isUpdating || !editFormData.stockQuantity}
                          >
                            {isUpdating ? (
                              <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Update Variant
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Variant</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this variant? This
                          action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDeleteVariant}
                          disabled={isDeleting !== null}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? (
                            <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
