"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconChartBar,
  IconTrendingUp,
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconAlertTriangle,
  IconRefresh,
  IconDownload,
  IconCalendar,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// Types for reports data
interface ProfitMargin {
  costPrice: number;
  sellingPrice: number;
  profit: number;
  margin: number;
}

interface SalesData {
  totalOrders: number;
  totalQuantitySold: number;
  totalRevenue: number;
}

interface ProductProfit {
  id: string;
  name: string;
  sku?: string;
  brand?: string;
  category?: string;
  costPrice: number;
  originalPrice: number;
  discountPrice?: number;
  discountPercent?: number;
  effectivePrice: number;
  profitMargin: ProfitMargin;
  stockQuantity: number;
  sales: SalesData;
}

interface OverallMetrics {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalItemsSold: number;
  grossRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPercent: number;
}

interface TopProduct {
  id: string;
  name: string;
  sku?: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderCount: number;
}

interface SalesByMethod {
  method: string;
  orderCount: number;
  totalRevenue: number;
}

interface TrendData {
  period: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  uniqueCustomers: number;
}

interface InventorySummary {
  totalInventoryValue: number;
  totalItemsInStock: number;
  totalProducts: number;
  lowStockThreshold: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku?: string;
  stockQuantity: number;
  brand?: string;
  category?: string;
}

interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  recentCustomers: number;
  averageCustomerValue: number;
  highestOrderValue: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

interface AcquisitionTrend {
  month: string;
  newCustomers: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Data states
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(
    null
  );
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesByDelivery, setSalesByDelivery] = useState<SalesByMethod[]>([]);
  const [salesByPayment, setSalesByPayment] = useState<SalesByMethod[]>([]);
  const [profitMargins, setProfitMargins] = useState<ProductProfit[]>([]);
  const [salesTrends, setSalesTrends] = useState<TrendData[]>([]);
  const [inventorySummary, setInventorySummary] =
    useState<InventorySummary | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [outOfStockProducts, setOutOfStockProducts] = useState<
    LowStockProduct[]
  >([]);
  const [customerSummary, setCustomerSummary] =
    useState<CustomerSummary | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [acquisitionTrends, setAcquisitionTrends] = useState<
    AcquisitionTrend[]
  >([]);

  // Pagination and sorting
  const [profitMarginsPage] = useState(1);
  const [profitMarginsSort, setProfitMarginsSort] = useState("margin");
  const [profitMarginsOrder, setProfitMarginsOrder] = useState("desc");

  const fetchOverallMetrics = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Reports] fetchOverallMetrics start", { dateRange });
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await apiClient.get(
        `/reports/overall-metrics?${params}`
      );

      console.log("[Reports] fetchOverallMetrics response", response);
      if (response.data && !response.error) {
        const payload = (response.data as any).data ?? response.data;
        console.log("[Reports] parsed overall metrics", payload);
        setOverallMetrics(payload.summary ?? null);
        setTopProducts(payload.topProducts ?? []);
        setSalesByDelivery(payload.salesByDeliveryMethod ?? []);
        setSalesByPayment(payload.salesByPaymentMethod ?? []);
      }
    } catch (error) {
      console.error("Error fetching overall metrics:", error);
      toast.error("Failed to fetch overall metrics");
    } finally {
      setLoading(false);
      console.log("[Reports] fetchOverallMetrics done");
    }
  }, [dateRange]);

  const fetchProfitMargins = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Reports] fetchProfitMargins start", {
        profitMarginsPage,
        profitMarginsSort,
        profitMarginsOrder,
      });
      const params = new URLSearchParams({
        page: profitMarginsPage.toString(),
        limit: "20",
        sortBy: profitMarginsSort,
        sortOrder: profitMarginsOrder,
      });

      const response = await apiClient.get(`/reports/profit-margins?${params}`);

      console.log("[Reports] fetchProfitMargins response", response);
      if (response.data && !response.error) {
        const payload = (response.data as any).data ?? response.data;
        console.log("[Reports] parsed profit margins", payload);
        setProfitMargins(payload.products ?? []);
      }
    } catch (error) {
      console.error("Error fetching profit margins:", error);
      toast.error("Failed to fetch profit margins");
    } finally {
      setLoading(false);
      console.log("[Reports] fetchProfitMargins done");
    }
  }, [profitMarginsPage, profitMarginsSort, profitMarginsOrder]);

  const fetchSalesTrends = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Reports] fetchSalesTrends start", { dateRange });
      const params = new URLSearchParams({
        period: "daily",
      });
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await apiClient.get(`/reports/sales-trends?${params}`);

      console.log("[Reports] fetchSalesTrends response", response);
      if (response.data && !response.error) {
        const payload = (response.data as any).data ?? response.data;
        console.log("[Reports] parsed sales trends", payload);
        setSalesTrends(payload.trends ?? []);
      }
    } catch (error) {
      console.error("Error fetching sales trends:", error);
      toast.error("Failed to fetch sales trends");
    } finally {
      setLoading(false);
      console.log("[Reports] fetchSalesTrends done");
    }
  }, [dateRange]);

  const fetchInventoryStatus = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Reports] fetchInventoryStatus start");
      const response = await apiClient.get("/reports/inventory-status");

      console.log("[Reports] fetchInventoryStatus response", response);
      if (response.data && !response.error) {
        const payload = (response.data as any).data ?? response.data;
        console.log("[Reports] parsed inventory status", payload);
        setInventorySummary(payload.summary ?? null);
        setLowStockProducts(payload.lowStockProducts ?? []);
        setOutOfStockProducts(payload.outOfStockProducts ?? []);
      }
    } catch (error) {
      console.error("Error fetching inventory status:", error);
      toast.error("Failed to fetch inventory status");
    } finally {
      setLoading(false);
      console.log("[Reports] fetchInventoryStatus done");
    }
  }, []);

  const fetchCustomerInsights = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Reports] fetchCustomerInsights start", { dateRange });
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await apiClient.get(
        `/reports/customer-insights?${params}`
      );

      console.log("[Reports] fetchCustomerInsights response", response);
      if (response.data && !response.error) {
        const payload = (response.data as any).data ?? response.data;
        console.log("[Reports] parsed customer insights", payload);
        setCustomerSummary(payload.summary ?? null);
        setTopCustomers(payload.topCustomers ?? []);
        setAcquisitionTrends(payload.acquisitionTrends ?? []);
      }
    } catch (error) {
      console.error("Error fetching customer insights:", error);
      toast.error("Failed to fetch customer insights");
    } finally {
      setLoading(false);
      console.log("[Reports] fetchCustomerInsights done");
    }
  }, [dateRange]);

  const refreshAllData = useCallback(async () => {
    console.log("[Reports] refreshAllData invoked");
    await Promise.all([
      fetchOverallMetrics(),
      fetchProfitMargins(),
      fetchSalesTrends(),
      fetchInventoryStatus(),
      fetchCustomerInsights(),
    ]);
    console.log("[Reports] refreshAllData finished");
  }, [
    fetchOverallMetrics,
    fetchProfitMargins,
    fetchSalesTrends,
    fetchInventoryStatus,
    fetchCustomerInsights,
  ]);

  // Only fetch when user clicks Generate/Refresh; don't auto-fetch on date typing
  useEffect(() => {
    // initial load
    refreshAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 50) return "text-green-600";
    if (margin >= 25) return "text-yellow-600";
    return "text-red-600";
  };

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
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">
                          Reports & Analytics
                        </h1>
                        <p className="text-gray-600">
                          Business intelligence and performance insights
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshAllData}
                          disabled={loading}
                        >
                          <IconRefresh className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        <Button
                          size="sm"
                          onClick={refreshAllData}
                          disabled={loading}
                        >
                          <IconChartBar className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                        <Button variant="outline" size="sm">
                          <IconDownload className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconCalendar className="h-5 w-5" />
                          Date Range Filter
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={dateRange.startDate}
                              onChange={(e) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  startDate: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={dateRange.endDate}
                              onChange={(e) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  endDate: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <Button
                            variant="outline"
                            onClick={() =>
                              setDateRange({ startDate: "", endDate: "" })
                            }
                          >
                            Clear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Navigation Tabs */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      {[
                        {
                          id: "overview",
                          label: "Overview",
                          icon: IconChartBar,
                        },
                        {
                          id: "profit",
                          label: "Profit Margins",
                          icon: IconTrendingUp,
                        },
                        {
                          id: "sales",
                          label: "Sales Trends",
                          icon: IconShoppingCart,
                        },
                        {
                          id: "inventory",
                          label: "Inventory",
                          icon: IconPackage,
                        },
                        {
                          id: "customers",
                          label: "Customers",
                          icon: IconUsers,
                        },
                      ].map((tab) => (
                        <Button
                          key={tab.id}
                          variant={activeTab === tab.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setActiveTab(tab.id)}
                          className="flex items-center gap-2"
                        >
                          <tab.icon className="h-4 w-4" />
                          {tab.label}
                        </Button>
                      ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Total Revenue
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {overallMetrics
                                      ? formatCurrency(
                                          overallMetrics.totalRevenue
                                        )
                                      : "—"}
                                  </p>
                                </div>
                                <span className="h-8 w-8 inline-flex items-center justify-center text-green-600 text-xl">
                                  ₵
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Total Orders
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {overallMetrics
                                      ? overallMetrics.totalOrders
                                      : "—"}
                                  </p>
                                </div>
                                <IconShoppingCart className="h-8 w-8 text-blue-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Gross Profit
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {overallMetrics
                                      ? formatCurrency(
                                          overallMetrics.grossProfit
                                        )
                                      : "—"}
                                  </p>
                                </div>
                                <IconTrendingUp className="h-8 w-8 text-green-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Profit Margin
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {overallMetrics
                                      ? `${overallMetrics.profitMarginPercent.toFixed(
                                          1
                                        )}%`
                                      : "—"}
                                  </p>
                                </div>
                                <IconChartBar className="h-8 w-8 text-purple-600" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Top Products */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Quantity Sold</TableHead>
                                  <TableHead>Revenue</TableHead>
                                  <TableHead>Orders</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {topProducts.map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                      {product.name}
                                    </TableCell>
                                    <TableCell>{product.sku || "—"}</TableCell>
                                    <TableCell>
                                      {product.totalQuantitySold}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(product.totalRevenue)}
                                    </TableCell>
                                    <TableCell>{product.orderCount}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>

                        {/* Sales by Method */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Sales by Delivery Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {salesByDelivery.map((method) => (
                                  <div
                                    key={method.method}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="capitalize">
                                      {method.method}
                                    </span>
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {formatCurrency(method.totalRevenue)}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {method.orderCount} orders
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Sales by Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {salesByPayment.map((method) => (
                                  <div
                                    key={method.method}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="capitalize">
                                      {method.method.replace("_", " ")}
                                    </span>
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {formatCurrency(method.totalRevenue)}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {method.orderCount} orders
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Profit Margins Tab */}
                    {activeTab === "profit" && (
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Product Profit Margins</CardTitle>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={profitMarginsSort}
                                  onValueChange={setProfitMarginsSort}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="margin">
                                      Margin %
                                    </SelectItem>
                                    <SelectItem value="profit">
                                      Profit
                                    </SelectItem>
                                    <SelectItem value="costPrice">
                                      Cost Price
                                    </SelectItem>
                                    <SelectItem value="sellingPrice">
                                      Selling Price
                                    </SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={profitMarginsOrder}
                                  onValueChange={setProfitMarginsOrder}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="desc">
                                      Descending
                                    </SelectItem>
                                    <SelectItem value="asc">
                                      Ascending
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Brand</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Cost Price</TableHead>
                                  <TableHead>Selling Price</TableHead>
                                  <TableHead>Profit</TableHead>
                                  <TableHead>Margin %</TableHead>
                                  <TableHead>Stock</TableHead>
                                  <TableHead>Sales</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {profitMargins.map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                      <div>
                                        <p>{product.name}</p>
                                        {product.sku && (
                                          <p className="text-sm text-gray-600">
                                            {product.sku}
                                          </p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {product.brand || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {product.category || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(product.costPrice)}
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <p>
                                          {formatCurrency(
                                            product.effectivePrice
                                          )}
                                        </p>
                                        {(product.discountPrice ||
                                          product.discountPercent) && (
                                          <p className="text-sm text-gray-600 line-through">
                                            {formatCurrency(
                                              product.originalPrice
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell
                                      className={getProfitMarginColor(
                                        product.profitMargin.profit
                                      )}
                                    >
                                      {formatCurrency(
                                        product.profitMargin.profit
                                      )}
                                    </TableCell>
                                    <TableCell
                                      className={getProfitMarginColor(
                                        product.profitMargin.margin
                                      )}
                                    >
                                      {product.profitMargin.margin.toFixed(1)}%
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          product.stockQuantity === 0
                                            ? "destructive"
                                            : product.stockQuantity <= 10
                                            ? "secondary"
                                            : "default"
                                        }
                                      >
                                        {product.stockQuantity}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-sm">
                                        <p>
                                          {product.sales.totalQuantitySold} sold
                                        </p>
                                        <p className="text-gray-600">
                                          {formatCurrency(
                                            product.sales.totalRevenue
                                          )}
                                        </p>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Sales Trends Tab */}
                    {activeTab === "sales" && (
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Sales Trends</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Orders</TableHead>
                                  <TableHead>Revenue</TableHead>
                                  <TableHead>Avg Order Value</TableHead>
                                  <TableHead>Unique Customers</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {salesTrends.map((trend, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {formatDate(trend.period)}
                                    </TableCell>
                                    <TableCell>{trend.orderCount}</TableCell>
                                    <TableCell>
                                      {formatCurrency(trend.totalRevenue)}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(trend.averageOrderValue)}
                                    </TableCell>
                                    <TableCell>
                                      {trend.uniqueCustomers}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === "inventory" && (
                      <div className="space-y-6">
                        {/* Inventory Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Total Inventory Value
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {inventorySummary
                                      ? formatCurrency(
                                          inventorySummary.totalInventoryValue
                                        )
                                      : "—"}
                                  </p>
                                </div>
                                <IconPackage className="h-8 w-8 text-blue-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Total Items in Stock
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {inventorySummary
                                      ? inventorySummary.totalItemsInStock
                                      : "—"}
                                  </p>
                                </div>
                                <IconPackage className="h-8 w-8 text-green-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Total Products
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {inventorySummary
                                      ? inventorySummary.totalProducts
                                      : "—"}
                                  </p>
                                </div>
                                <IconPackage className="h-8 w-8 text-purple-600" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Low Stock Products */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <IconAlertTriangle className="h-5 w-5 text-orange-500" />
                              Low Stock Products
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Brand</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Stock Quantity</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {lowStockProducts.map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                      {product.name}
                                    </TableCell>
                                    <TableCell>{product.sku || "—"}</TableCell>
                                    <TableCell>
                                      {product.brand || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {product.category || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {product.stockQuantity}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">
                                        Low Stock
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>

                        {/* Out of Stock Products */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <IconAlertTriangle className="h-5 w-5 text-red-500" />
                              Out of Stock Products
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Brand</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Stock Quantity</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {outOfStockProducts.map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                      {product.name}
                                    </TableCell>
                                    <TableCell>{product.sku || "—"}</TableCell>
                                    <TableCell>
                                      {product.brand || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {product.category || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {product.stockQuantity}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="destructive">
                                        Out of Stock
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Customers Tab */}
                    {activeTab === "customers" && (
                      <div className="space-y-6">
                        {/* Customer Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Total Customers
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {customerSummary
                                      ? customerSummary.totalCustomers
                                      : "—"}
                                  </p>
                                </div>
                                <IconUsers className="h-8 w-8 text-blue-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Active Customers
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {customerSummary
                                      ? customerSummary.activeCustomers
                                      : "—"}
                                  </p>
                                </div>
                                <IconUsers className="h-8 w-8 text-green-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Recent Customers
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {customerSummary
                                      ? customerSummary.recentCustomers
                                      : "—"}
                                  </p>
                                </div>
                                <IconUsers className="h-8 w-8 text-purple-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Avg Customer Value
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {customerSummary
                                      ? formatCurrency(
                                          customerSummary.averageCustomerValue
                                        )
                                      : "—"}
                                  </p>
                                </div>
                                <span className="h-8 w-8 inline-flex items-center justify-center text-yellow-600 text-xl">
                                  ₵
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Top Customers */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Top Customers</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Customer</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Total Orders</TableHead>
                                  <TableHead>Total Spent</TableHead>
                                  <TableHead>Avg Order Value</TableHead>
                                  <TableHead>Last Order</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {topCustomers.map((customer) => (
                                  <TableRow key={customer.id}>
                                    <TableCell className="font-medium">
                                      {customer.name}
                                    </TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>
                                      {customer.totalOrders}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(customer.totalSpent)}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(
                                        customer.averageOrderValue
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {formatDate(customer.lastOrderDate)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>

                        {/* Acquisition Trends */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Customer Acquisition Trends</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Month</TableHead>
                                  <TableHead>New Customers</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {acquisitionTrends.map((trend, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {formatDate(trend.month)}
                                    </TableCell>
                                    <TableCell>{trend.newCustomers}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}
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
