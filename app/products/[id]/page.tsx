"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconPackage,
  IconTrendingUp,
  IconTruck,
  IconShoppingCart,
  IconLoader,
} from "@tabler/icons-react";
import { apiClient, Product } from "@/lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProductById(productId);

        if (response.data) {
          const data = response.data as { product: Product };
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteProduct(product.id);
      toast.success("Product deleted successfully");
      router.push("/clothes");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const getProductImages = () => {
    if (!product) return [];

    // Combine main image with additional images
    const images = [];
    if (product.imageUrl) {
      images.push(product.imageUrl);
    }
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }

    // Remove duplicates
    return [...new Set(images)];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  const getDiscountBadge = () => {
    if (!product) return null;

    if (product.discountPercent && product.discountPercent > 0) {
      return (
        <Badge variant="destructive" className="ml-2">
          -{product.discountPercent}%
        </Badge>
      );
    }

    if (product.discountPrice && product.discountPrice < product.price) {
      const discountPercent = Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      );
      return (
        <Badge variant="destructive" className="ml-2">
          -{discountPercent}%
        </Badge>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 items-center justify-center">
              <div className="flex items-center space-x-2">
                <IconLoader className="h-6 w-6 animate-spin" />
                <span>Loading product...</span>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <IconPackage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Product Not Found
                </h2>
                <p className="text-muted-foreground mb-4">
                  The product you&apos;re looking for doesn&apos;t exist or has
                  been deleted.
                </p>
                <Button onClick={() => router.push("/clothes")}>
                  <IconArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  const productImages = getProductImages();
  const currentImage = productImages[selectedImageIndex];

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
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/clothes")}
                      >
                        <IconArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                      </Button>
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">
                          {product.name}
                        </h1>
                        <p className="text-muted-foreground">
                          {product.sku && `SKU: ${product.sku}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/products/${product.id}/variants`}>
                        <Button variant="outline" size="sm">
                          <IconPackage className="h-4 w-4 mr-2" />
                          Manage Variants
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit Product
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <IconTrash className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Product Images</CardTitle>
                          <CardDescription>
                            {productImages.length} image
                            {productImages.length !== 1 ? "s" : ""} available
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {currentImage ? (
                            <div className="space-y-4">
                              {/* Main Image */}
                              <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                                <Image
                                  src={currentImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  priority
                                />
                              </div>

                              {/* Image Thumbnails */}
                              {productImages.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                  {productImages.map((image, index) => (
                                    <button
                                      key={index}
                                      onClick={() =>
                                        setSelectedImageIndex(index)
                                      }
                                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                                        selectedImageIndex === index
                                          ? "border-primary"
                                          : "border-transparent hover:border-gray-300"
                                      }`}
                                    >
                                      <Image
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <IconPackage className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                  No images available
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Description
                            </label>
                            <p className="mt-1">
                              {product.description ||
                                "No description available"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Brand
                              </label>
                              <p className="mt-1">
                                {product.brand?.name || "No brand"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Category
                              </label>
                              <p className="mt-1">
                                {product.category?.name ||
                                  product.legacyCategory ||
                                  "No category"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pricing */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Pricing Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center">
                            <span className="text-2xl font-bold">
                              {formatPrice(product.effectivePrice)}
                            </span>
                            {getDiscountBadge()}
                          </div>

                          {product.discountPrice &&
                            product.discountPrice < product.price && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <span>Regular price: </span>
                                <span className="line-through ml-1">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            )}

                          {product.costPrice && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Cost price:{" "}
                              </span>
                              <span>{formatPrice(product.costPrice)}</span>
                            </div>
                          )}

                          {product.profitMargin && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-800">
                                  Profit Margin
                                </span>
                                <span className="text-sm font-bold text-green-800">
                                  {product.profitMargin.margin.toFixed(1)}%
                                </span>
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                Profit:{" "}
                                {formatPrice(product.profitMargin.profit)}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Delivery Options */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Delivery Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <IconTruck className="h-4 w-4" />
                            <span className="text-sm">
                              {product.deliveryEligible
                                ? "Delivery available"
                                : "Delivery not available"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IconShoppingCart className="h-4 w-4" />
                            <span className="text-sm">
                              {product.pickupEligible
                                ? "Pickup available"
                                : "Pickup not available"}
                            </span>
                          </div>
                          {product.requiresSpecialDelivery && (
                            <div className="flex items-center space-x-2">
                              <IconTrendingUp className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-orange-600">
                                Requires special delivery
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
