"use client";

import { useState, useEffect, useRef } from "react";
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
  IconSortAscending,
  IconTrash,
  IconEdit,
  IconLoader,
  IconTag,
} from "@tabler/icons-react";
import { apiClient, Brand, BrandsResponse } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
  });
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [isUpdatingBrand, setIsUpdatingBrand] = useState(false);
  const [isDeletingBrand, setIsDeletingBrand] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getBrands();

      if (response.data && (response.data as BrandsResponse).brands) {
        setBrands((response.data as BrandsResponse).brands);
      } else if (response.data && Array.isArray(response.data)) {
        setBrands(response.data);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBrand = async () => {
    try {
      setIsAddingBrand(true);
      let logoUrl: string | undefined = formData.logoUrl || undefined;
      // Upload selected logo file if present
      if (logoFile) {
        if (!supabase) {
          toast.error("Image upload not available - Supabase not configured");
          return;
        }
        const ext = logoFile.name.split(".").pop() || "png";
        const path = `brands/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, logoFile, { upsert: false });
        if (uploadError) {
          toast.error("Failed to upload brand logo");
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(path);
        logoUrl = publicUrlData.publicUrl;
      }

      const response = await apiClient.createBrand({
        name: formData.name,
        description: formData.description || undefined,
        logo_url: logoUrl,
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
        toast.success("Brand created successfully");
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          logoUrl: "",
        });
        fetchBrands(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("Failed to create brand");
    } finally {
      setIsAddingBrand(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      setIsDeletingBrand(id);
      const resp = await apiClient.deleteBrand(id);
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }
      toast.success("Brand deleted successfully");
      fetchBrands(); // Refresh the list
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand");
    } finally {
      setIsDeletingBrand(null);
    }
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setEditFormData({
      name: brand.name || "",
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
    });
    setLogoFile(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand) return;
    try {
      setIsUpdatingBrand(true);
      let logoUrl: string | undefined = editFormData.logoUrl || undefined;
      if (logoFile) {
        if (!supabase) {
          toast.error("Image upload not available - Supabase not configured");
          return;
        }
        const ext = logoFile.name.split(".").pop() || "png";
        const path = `brands/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, logoFile, { upsert: false });
        if (uploadError) {
          toast.error("Failed to upload brand logo");
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(path);
        logoUrl = publicUrlData.publicUrl;
      }

      const resp = await apiClient.updateBrand(editingBrand.id, {
        name: editFormData.name,
        description: editFormData.description || undefined,
        logo_url: logoUrl,
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
      toast.success("Brand updated successfully");
      setIsEditDialogOpen(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (error) {
      console.error("Error updating brand:", error);
      toast.error("Failed to update brand");
    } finally {
      setIsUpdatingBrand(false);
    }
  };

  // Filter and sort brands
  const filteredAndSortedBrands = brands
    .filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.description &&
          brand.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "createdAt":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

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
                        <span>Loading brands...</span>
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
                        Brand Management
                      </h1>
                      <p className="text-muted-foreground">
                        Manage product brands and their information
                      </p>
                    </div>
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <IconPlus className="h-4 w-4 mr-2" />
                          Add Brand
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Brand</DialogTitle>
                          <DialogDescription>
                            Create a new brand for your products.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Brand Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter brand name"
                              required
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
                              placeholder="Enter brand description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="brandLogo">Brand Logo</Label>
                            <div className="flex items-center gap-3">
                              <Input
                                id="brandLogo"
                                type="file"
                                accept="image/*"
                                ref={logoFileInputRef}
                                onChange={(e) =>
                                  setLogoFile(e.target.files?.[0] || null)
                                }
                              />
                              <span className="text-xs text-muted-foreground">
                                Optional: You can still paste a URL below
                              </span>
                            </div>
                            <Input
                              id="logoUrl"
                              value={formData.logoUrl}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  logoUrl: e.target.value,
                                })
                              }
                              placeholder="Or paste logo URL"
                            />
                            {(logoFile || formData.logoUrl) && (
                              <div className="mt-2">
                                <Image
                                  src={
                                    logoFile
                                      ? URL.createObjectURL(logoFile)
                                      : formData.logoUrl
                                  }
                                  alt="Brand logo preview"
                                  width={64}
                                  height={64}
                                  className="h-16 w-16 object-cover rounded border"
                                />
                              </div>
                            )}
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
                            onClick={handleAddBrand}
                            disabled={isAddingBrand || !formData.name.trim()}
                          >
                            {isAddingBrand ? (
                              <>
                                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Brand"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {/* Edit Brand Dialog */}
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Brand</DialogTitle>
                          <DialogDescription>
                            Update brand information and save changes.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit_name">Brand Name *</Label>
                            <Input
                              id="edit_name"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter brand name"
                              required
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
                              placeholder="Enter brand description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_brandLogo">Brand Logo</Label>
                            <div className="flex items-center gap-3">
                              <Input
                                id="edit_brandLogo"
                                type="file"
                                accept="image/*"
                                ref={logoFileInputRef}
                                onChange={(e) =>
                                  setLogoFile(e.target.files?.[0] || null)
                                }
                              />
                              <span className="text-xs text-muted-foreground">
                                Optional: You can still paste a URL below
                              </span>
                            </div>
                            <Input
                              id="edit_logoUrl"
                              value={editFormData.logoUrl}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  logoUrl: e.target.value,
                                })
                              }
                              placeholder="Or paste logo URL"
                            />
                            {(logoFile || editFormData.logoUrl) && (
                              <div className="mt-2">
                                <Image
                                  src={
                                    logoFile
                                      ? URL.createObjectURL(logoFile)
                                      : editFormData.logoUrl
                                  }
                                  alt="Brand logo preview"
                                  width={64}
                                  height={64}
                                  className="h-16 w-16 object-cover rounded border"
                                />
                              </div>
                            )}
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
                            onClick={handleUpdateBrand}
                            disabled={
                              isUpdatingBrand || !editFormData.name.trim()
                            }
                          >
                            {isUpdatingBrand ? (
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {brands.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Brands
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {filteredAndSortedBrands.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Filtered Brands
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {brands.filter((brand) => brand.isActive).length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active Brands
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
                        Find specific brands in your collection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search brands..."
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
                            <option value="createdAt">
                              Sort by Date Created
                            </option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Brands Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedBrands.map((brand) => (
                      <Card key={brand.id} className="overflow-hidden">
                        <div className="aspect-square relative bg-muted flex items-center justify-center">
                          {brand.logoUrl ? (
                            <Image
                              src={brand.logoUrl}
                              alt={brand.name}
                              fill
                              className="object-contain p-4"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <IconTag className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {brand.name}
                            </h3>
                            <Badge
                              variant={brand.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {brand.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {brand.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {brand.description}
                            </p>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {new Date(brand.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(brand)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBrand(brand.id)}
                                disabled={isDeletingBrand === brand.id}
                                className="text-red-500 hover:text-red-700"
                              >
                                {isDeletingBrand === brand.id ? (
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

                  {filteredAndSortedBrands.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <IconTag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No brands found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Add your first brand to get started"}
                        </p>
                        {!searchTerm && (
                          <Button onClick={() => setIsAddDialogOpen(true)}>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add Brand
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
