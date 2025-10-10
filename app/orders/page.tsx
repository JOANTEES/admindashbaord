"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconSearch,
  IconPackage,
  IconTruck,
  IconLoader,
  IconFilter,
  IconRefresh,
  IconEye,
} from "@tabler/icons-react";
import { ProtectedRoute } from "@/components/protected-route";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  itemsCount?: number;
  deliveryMethod: "pickup" | "delivery";
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  pickupLocationName?: string;
  deliveryAddress?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "ready_for_pickup"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "partial" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  subtotal: number;
}

interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "date" | "customer" | "total" | "status"
  >("date");
  const [activeTab, setActiveTab] = useState("pending");
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState<Record<
    string,
    unknown
  > | null>(null);

  const openOrderDetail = async (orderId: string) => {
    try {
      setDetailLoading(true);
      setIsDetailOpen(true);
      const resp = await apiClient.getAdminOrder(orderId);
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }
      const data = resp.data as { order?: Record<string, unknown> };
      setOrderDetail(data.order ?? null);
    } catch (e) {
      console.error("Failed to load order detail", e);
      setOrderDetail(null);
      toast.error("Failed to load order details");
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getOrders({ page: 1, limit: 20 });
      if ((response as unknown as { error?: string }).error) {
        throw new Error((response as unknown as { error?: string }).error);
      }
      const payload = response.data as {
        orders?: Array<Record<string, unknown>>;
      };

      if (payload.orders) {
        const mapped: Order[] = payload.orders.map((o) => {
          const totals =
            (
              o as {
                totals?: {
                  subtotal?: unknown;
                  taxAmount?: unknown;
                  shippingFee?: unknown;
                  totalAmount?: unknown;
                };
              }
            ).totals || {};

          const orderNumber = String(
            (o as { orderNumber?: unknown }).orderNumber ??
              (o as { order_number?: unknown }).order_number ??
              ""
          );

          const customerEmail = String(
            (o as { customerEmail?: unknown }).customerEmail ??
              (o as { customer_email?: unknown }).customer_email ??
              ""
          );

          const customerName = String(
            (o as { customer_name?: unknown }).customer_name ?? customerEmail
          );

          return {
            id: String(o.id ?? ""),
            orderNumber,
            customerName,
            customerEmail,
            customerPhone: String(
              (o as { customer_phone?: unknown }).customer_phone ?? ""
            ),
            items: [],
            itemsCount: Number((o as { itemsCount?: unknown }).itemsCount ?? 0),
            deliveryMethod: String(
              (o as { deliveryMethod?: unknown }).deliveryMethod ??
                (o as { delivery_method?: unknown }).delivery_method ??
                "delivery"
            ) as "pickup" | "delivery",
            deliveryZoneId: String(
              (o as { delivery_zone_id?: unknown }).delivery_zone_id ?? ""
            ),
            deliveryZoneName: String(
              (o as { deliveryZoneName?: unknown }).deliveryZoneName ??
                (o as { delivery_zone_name?: unknown }).delivery_zone_name ??
                ""
            ),
            pickupLocationName: String(
              (o as { pickupLocationName?: unknown }).pickupLocationName ?? ""
            ),
            deliveryAddress: String(
              (o as { delivery_address?: unknown }).delivery_address ?? ""
            ),
            subtotal: Number(
              (totals as { subtotal?: unknown }).subtotal ??
                (o as { subtotal_amount?: unknown }).subtotal_amount ??
                0
            ),
            tax: Number(
              (totals as { taxAmount?: unknown }).taxAmount ??
                (o as { tax_amount?: unknown }).tax_amount ??
                0
            ),
            shipping: Number(
              (totals as { shippingFee?: unknown }).shippingFee ??
                (o as { shipping_amount?: unknown }).shipping_amount ??
                0
            ),
            total: Number(
              (totals as { totalAmount?: unknown }).totalAmount ??
                (o as { total_amount?: unknown }).total_amount ??
                (o as { total?: unknown }).total ??
                0
            ),
            status: String(
              (o as { status?: unknown }).status ?? "pending"
            ) as Order["status"],
            paymentStatus: String(
              (o as { paymentStatus?: unknown }).paymentStatus ??
                (o as { payment_status?: unknown }).payment_status ??
                "pending"
            ) as Order["paymentStatus"],
            createdAt: String(
              (o as { createdAt?: unknown }).createdAt ??
                (o as { created_at?: unknown }).created_at ??
                ""
            ),
            updatedAt: String(
              (o as { updatedAt?: unknown }).updatedAt ??
                (o as { updated_at?: unknown }).updated_at ??
                ""
            ),
          };
        });
        setOrders(mapped);
        calculateSummary(mapped);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const calculateSummary = (orders: Order[]) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) =>
      ["pending", "processing"].includes(order.status)
    ).length;
    const completedOrders = orders.filter((order) =>
      ["completed", "delivered"].includes(order.status)
    ).length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setSummary({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
    });
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const resp = await apiClient.updateOrderStatus(orderId, newStatus);
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update order status";
      toast.error(message);
    }
  };

  // Get orders for current tab
  const getOrdersForTab = (tab: string) => {
    let statuses: string[] = [];

    switch (tab) {
      case "pending":
        statuses = ["pending"];
        break;
      case "confirmed":
        statuses = ["confirmed"];
        break;
      case "processing":
        statuses = ["processing", "ready_for_pickup"];
        break;
      case "shipping":
        statuses = ["shipped", "out_for_delivery"];
        break;
      case "completed":
        statuses = ["completed", "delivered"];
        break;
      case "cancelled":
        statuses = ["cancelled", "refunded"];
        break;
      default:
        statuses = ["pending"];
    }

    return orders.filter((order) => statuses.includes(order.status));
  };

  const getFilteredOrders = (tab: string) => {
    return getOrdersForTab(tab)
      .filter((order) => {
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDelivery =
          deliveryFilter === "all" ||
          (deliveryFilter === "pickup" && order.deliveryMethod === "pickup") ||
          (deliveryFilter === "delivery" &&
            order.deliveryMethod === "delivery");

        return matchesSearch && matchesDelivery;
      })
      .sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortBy) {
          case "customer":
            aValue = a.customerName;
            bValue = b.customerName;
            break;
          case "total":
            aValue = a.total;
            bValue = b.total;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "date":
          default:
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        return aValue < bValue ? 1 : -1;
      });
  };

  const renderOrderTable = (orders: Order[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Delivery Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div className="font-medium">{order.orderNumber}</div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-sm text-muted-foreground">
                  {order.customerEmail}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {order.itemsCount ?? 0} item
                {(order.itemsCount ?? 0) !== 1 ? "s" : ""}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                className={
                  order.deliveryMethod === "pickup"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }
              >
                {order.deliveryMethod === "pickup" ? (
                  <>
                    <IconPackage className="h-3 w-3 mr-1" />
                    Pickup
                  </>
                ) : (
                  <>
                    <IconTruck className="h-3 w-3 mr-1" />
                    Delivery
                  </>
                )}
              </Badge>
              {order.deliveryMethod === "delivery" &&
                order.deliveryZoneName && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {order.deliveryZoneName}
                  </div>
                )}
            </TableCell>
            <TableCell>
              <Select
                value={order.status}
                onValueChange={(value: Order["status"]) =>
                  handleOrderStatusUpdate(order.id, value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready_for_pickup">
                    Ready for Pickup
                  </SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">
                    Out for Delivery
                  </SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Badge
                className={
                  order.paymentStatus === "paid"
                    ? "bg-green-500"
                    : order.paymentStatus === "pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }
              >
                {order.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="font-medium">₵{order.total.toFixed(2)}</div>
            </TableCell>
            <TableCell>
              <div className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openOrderDetail(order.id)}
              >
                <IconEye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderEmptyState = (message: string) => (
    <div className="text-center py-12">
      <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-muted-foreground">
        {searchTerm || deliveryFilter !== "all"
          ? "Try adjusting your search criteria"
          : "No orders in this category"}
      </p>
    </div>
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
                        <span>Loading orders...</span>
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
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        Order Management
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Track and manage customer orders
                      </p>
                    </div>
                    <Button onClick={fetchOrders} variant="outline">
                      <IconRefresh className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Orders
                        </CardTitle>
                        <IconPackage className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {summary.totalOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          all time orders
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Pending Orders
                        </CardTitle>
                        <IconLoader className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                          {summary.pendingOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          needs attention
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Completed Orders
                        </CardTitle>
                        <IconPackage className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                          {summary.completedOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          successfully delivered
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Revenue
                        </CardTitle>
                        <IconTruck className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-500">
                          ₵{summary.totalRevenue.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          from all orders
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Filters */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Search & Filter</CardTitle>
                      <CardDescription>
                        Find specific orders and filter by delivery method
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select
                          value={deliveryFilter}
                          onValueChange={setDeliveryFilter}
                        >
                          <SelectTrigger>
                            <IconFilter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Delivery Method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="pickup">Pickup Only</SelectItem>
                            <SelectItem value="delivery">
                              Delivery Only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={sortBy}
                          onValueChange={(
                            value: "date" | "customer" | "total" | "status"
                          ) => setSortBy(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Order Date</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="total">Order Total</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders Tabs */}
                  <Card>
                    <CardContent className="p-0">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-6">
                          <TabsTrigger value="pending">
                            Pending ({getOrdersForTab("pending").length})
                          </TabsTrigger>
                          <TabsTrigger value="confirmed">
                            Confirmed ({getOrdersForTab("confirmed").length})
                          </TabsTrigger>
                          <TabsTrigger value="processing">
                            Processing ({getOrdersForTab("processing").length})
                          </TabsTrigger>
                          <TabsTrigger value="shipping">
                            Shipping ({getOrdersForTab("shipping").length})
                          </TabsTrigger>
                          <TabsTrigger value="completed">
                            Completed ({getOrdersForTab("completed").length})
                          </TabsTrigger>
                          <TabsTrigger value="cancelled">
                            Cancelled ({getOrdersForTab("cancelled").length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Pending Orders
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {getFilteredOrders("pending").length} orders
                              </span>
                            </div>
                            {getFilteredOrders("pending").length > 0
                              ? renderOrderTable(getFilteredOrders("pending"))
                              : renderEmptyState("No pending orders")}
                          </div>
                        </TabsContent>

                        <TabsContent value="confirmed" className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Confirmed Orders
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {getFilteredOrders("confirmed").length} orders
                              </span>
                            </div>
                            {getFilteredOrders("confirmed").length > 0
                              ? renderOrderTable(getFilteredOrders("confirmed"))
                              : renderEmptyState("No confirmed orders")}
                          </div>
                        </TabsContent>

                        <TabsContent value="processing" className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Processing Orders
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {getFilteredOrders("processing").length} orders
                              </span>
                            </div>
                            {getFilteredOrders("processing").length > 0
                              ? renderOrderTable(
                                  getFilteredOrders("processing")
                                )
                              : renderEmptyState("No processing orders")}
                          </div>
                        </TabsContent>

                        <TabsContent value="shipping" className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Shipping Orders
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {getFilteredOrders("shipping").length} orders
                              </span>
                            </div>
                            {getFilteredOrders("shipping").length > 0
                              ? renderOrderTable(getFilteredOrders("shipping"))
                              : renderEmptyState("No shipping orders")}
                          </div>
                        </TabsContent>

                        <TabsContent value="completed" className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Completed Orders
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {getFilteredOrders("completed").length} orders
                              </span>
                            </div>
                            {getFilteredOrders("completed").length > 0
                              ? renderOrderTable(getFilteredOrders("completed"))
                              : renderEmptyState("No completed orders")}
                          </div>
                        </TabsContent>

                        <TabsContent value="cancelled" className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Cancelled Orders
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                {getFilteredOrders("cancelled").length} orders
                              </span>
                            </div>
                            {getFilteredOrders("cancelled").length > 0
                              ? renderOrderTable(getFilteredOrders("cancelled"))
                              : renderEmptyState("No cancelled orders")}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <OrderDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        loading={detailLoading}
        order={orderDetail}
      />
    </ProtectedRoute>
  );
}

// Detail Dialog UI mounted at end to avoid layout clipping
function OrderDetailDialog({
  open,
  onOpenChange,
  loading,
  order,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading: boolean;
  order: Record<string, unknown> | null;
}) {
  const totals = (order?.totals as Record<string, unknown>) || {};
  const items = (order?.items as Array<Record<string, unknown>>) || [];
  const deliveryMethod = String(order?.deliveryMethod ?? "");
  const deliveryZone = order?.deliveryZone as Record<string, unknown> | null;
  const pickupLocation = order?.pickupLocation as Record<
    string,
    unknown
  > | null;
  const deliveryAddress = order?.deliveryAddress as Record<
    string,
    unknown
  > | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading...
          </div>
        ) : !order ? (
          <div className="py-10 text-center text-red-600">
            Failed to load order
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm text-muted-foreground">Order #</div>
                <div className="text-lg font-semibold">
                  {String(order.orderNumber ?? "")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{String(order.status ?? "")}</div>
                <div className="text-xs text-muted-foreground">
                  Payment: {String(order.paymentStatus ?? "")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Totals</div>
                <div className="text-sm">
                  Subtotal: ₵{Number(totals.subtotal ?? 0).toFixed(2)}
                </div>
                <div className="text-sm">
                  Tax: ₵{Number(totals.taxAmount ?? 0).toFixed(2)}
                </div>
                <div className="text-sm">
                  Shipping: ₵{Number(totals.shippingFee ?? 0).toFixed(2)}
                </div>
                <div className="text-sm font-medium">
                  Total: ₵{Number(totals.totalAmount ?? 0).toFixed(2)}
                </div>
                <div className="text-sm text-green-600">
                  Paid: ₵{Number(totals.amountPaid ?? 0).toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Fulfillment</div>
                <div className="text-sm">Method: {deliveryMethod}</div>
                {deliveryMethod === "delivery" && deliveryZone && (
                  <div className="text-sm">
                    Zone: {String(deliveryZone.name ?? "")}
                  </div>
                )}
                {deliveryMethod === "delivery" && deliveryAddress && (
                  <div className="mt-2 space-y-0.5">
                    <div className="text-sm font-medium">Delivery Address</div>
                    <div className="text-sm">
                      {String(
                        ((deliveryAddress.area as string) ??
                          (deliveryAddress as { areaName?: unknown })
                            .areaName ??
                          "") as string
                      )}
                      {(() => {
                        const lm = (deliveryAddress as { landmark?: unknown })
                          .landmark as string | undefined;
                        return lm ? ` • ${lm}` : "";
                      })()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {String(
                        ((deliveryAddress.city as string) ??
                          (deliveryAddress as { cityName?: unknown })
                            .cityName ??
                          "") as string
                      )}
                      {(() => {
                        const region = (
                          deliveryAddress as {
                            region?: unknown;
                            regionName?: unknown;
                          }
                        ).region as string | undefined;
                        const regionName = (
                          deliveryAddress as {
                            regionName?: unknown;
                          }
                        ).regionName as string | undefined;
                        const r = region ?? regionName;
                        return r ? `, ${r}` : "";
                      })()}
                    </div>
                    {(() => {
                      const phone = (
                        deliveryAddress as {
                          phone?: unknown;
                          contactPhone?: unknown;
                        }
                      ).phone as string | undefined;
                      const contactPhone = (
                        deliveryAddress as {
                          contactPhone?: unknown;
                        }
                      ).contactPhone as string | undefined;
                      const p = phone ?? contactPhone;
                      return p ? (
                        <div className="text-xs">Phone: {p}</div>
                      ) : null;
                    })()}
                    {(() => {
                      const maps = (
                        deliveryAddress as {
                          maps?: unknown;
                          googleMapsLink?: unknown;
                        }
                      ).maps as string | undefined;
                      const googleMapsLink = (
                        deliveryAddress as {
                          googleMapsLink?: unknown;
                        }
                      ).googleMapsLink as string | undefined;
                      const link = maps ?? googleMapsLink;
                      return link ? (
                        <div className="text-xs">
                          <a
                            className="text-blue-600 underline"
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View on map
                          </a>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                {deliveryMethod === "pickup" && pickupLocation && (
                  <div className="text-sm">
                    Pickup: {String(pickupLocation.name ?? "")}{" "}
                    {(pickupLocation as { mapsLink?: string }).mapsLink && (
                      <a
                        className="text-blue-600 underline ml-1"
                        href={String(
                          (pickupLocation as { mapsLink?: string }).mapsLink
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        map
                      </a>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Created:{" "}
                  {new Date(String(order.createdAt ?? "")).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Items</div>
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border rounded p-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {String(it.productName ?? "")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(() => {
                          const parts: string[] = [];
                          const size = (it as { size?: unknown }).size as
                            | string
                            | null
                            | undefined;
                          const color = (it as { color?: unknown }).color as
                            | string
                            | null
                            | undefined;
                          const qty = Number(
                            (it as { quantity?: unknown }).quantity ?? 0
                          );
                          if (size) parts.push(String(size));
                          if (color) parts.push(String(color));
                          parts.push(`qty ${qty}`);
                          return parts.join(" • ");
                        })()}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      ₵{Number(it.subtotal ?? 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
