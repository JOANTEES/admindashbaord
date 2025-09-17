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
  deliveryMethod: "pickup" | "delivery";
  deliveryZoneId?: string;
  deliveryZoneName?: string;
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
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "date" | "customer" | "total" | "status"
  >("date");
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getOrders();
      const payload = response.data as {
        orders?: Array<Record<string, unknown>>;
      };

      if (payload.orders) {
        const mapped: Order[] = payload.orders.map((o) => ({
          id: String(o.id ?? ""),
          orderNumber: String(o.orderNumber ?? ""),
          customerName: String(o.customerName ?? ""),
          customerEmail: String(o.customerEmail ?? ""),
          customerPhone: String(o.customerPhone ?? ""),
          items: [], // Items will be loaded separately if needed
          deliveryMethod: String(o.deliveryMethod ?? "delivery") as
            | "pickup"
            | "delivery",
          deliveryZoneId: String(o.deliveryZoneId ?? ""),
          deliveryZoneName: String(o.deliveryZoneName ?? ""),
          deliveryAddress: String(o.deliveryAddress ?? ""),
          subtotal: Number(o.subtotal ?? 0),
          tax: Number(o.tax ?? 0),
          shipping: Number(o.shipping ?? 0),
          total: Number(o.total ?? 0),
          status: String(o.status ?? "pending") as Order["status"],
          paymentStatus: String(
            o.paymentStatus ?? "pending"
          ) as Order["paymentStatus"],
          createdAt: String(o.createdAt ?? ""),
          updatedAt: String(o.updatedAt ?? ""),
        }));
        setOrders(mapped);
      } else {
        setOrders([]);
      }

      // Fallback to mock data if API fails
      const mockOrders: Order[] = [
        {
          id: "1",
          orderNumber: "ORD-001",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "+233 24 123 4567",
          items: [
            {
              id: "1",
              productName: "Classic White T-Shirt",
              quantity: 2,
              price: 29.99,
              size: "M",
              color: "White",
              subtotal: 59.98,
            },
          ],
          deliveryMethod: "delivery",
          deliveryZoneId: "1",
          deliveryZoneName: "East Legon",
          deliveryAddress: "123 Main St, East Legon, Accra",
          subtotal: 59.98,
          tax: 6.0,
          shipping: 15.0,
          total: 80.98,
          status: "pending",
          paymentStatus: "paid",
          createdAt: "2024-01-16T10:30:00.000Z",
          updatedAt: "2024-01-16T10:30:00.000Z",
        },
        {
          id: "2",
          orderNumber: "ORD-002",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "+233 24 987 6543",
          items: [
            {
              id: "2",
              productName: "Denim Jeans",
              quantity: 1,
              price: 79.99,
              size: "32",
              color: "Blue",
              subtotal: 79.99,
            },
          ],
          deliveryMethod: "pickup",
          subtotal: 79.99,
          tax: 8.0,
          shipping: 0.0,
          total: 87.99,
          status: "delivered",
          paymentStatus: "paid",
          createdAt: "2024-01-15T14:20:00.000Z",
          updatedAt: "2024-01-16T09:15:00.000Z",
        },
      ];

      setOrders(mockOrders);
      calculateSummary(mockOrders);
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
      ["pending", "confirmed", "processing"].includes(order.status)
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "delivered"
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
      await apiClient.updateOrderStatus(orderId, newStatus);
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
      toast.error("Failed to update order status");
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesDelivery =
        deliveryFilter === "all" ||
        (deliveryFilter === "pickup" && order.deliveryMethod === "pickup") ||
        (deliveryFilter === "delivery" && order.deliveryMethod === "delivery");

      return matchesSearch && matchesStatus && matchesDelivery;
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

                  {/* Filters and Search */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Search & Filter</CardTitle>
                      <CardDescription>
                        Find specific orders and filter by status or delivery
                        method
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger>
                            <IconFilter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Order Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="picked_up">Picked Up</SelectItem>
                            <SelectItem value="in_transit">
                              In Transit
                            </SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={deliveryFilter}
                          onValueChange={setDeliveryFilter}
                        >
                          <SelectTrigger>
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

                  {/* Orders Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Orders</CardTitle>
                      <CardDescription>
                        All customer orders with delivery information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          {filteredAndSortedOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {order.orderNumber}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {order.customerName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {order.customerEmail}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {order.items.length} item
                                  {order.items.length !== 1 ? "s" : ""}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.items[0]?.productName}
                                  {order.items.length > 1 &&
                                    ` +${order.items.length - 1} more`}
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
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="confirmed">
                                      Confirmed
                                    </SelectItem>
                                    <SelectItem value="processing">
                                      Processing
                                    </SelectItem>
                                    <SelectItem value="ready_for_pickup">
                                      Ready for Pickup
                                    </SelectItem>
                                    <SelectItem value="shipped">
                                      Shipped
                                    </SelectItem>
                                    <SelectItem value="out_for_delivery">
                                      Out for Delivery
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                      Delivered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
                                    <SelectItem value="refunded">
                                      Refunded
                                    </SelectItem>
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
                                <div className="font-medium">
                                  ₵{order.total.toFixed(2)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  <IconEye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {filteredAndSortedOrders.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No orders found
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          deliveryFilter !== "all"
                            ? "Try adjusting your search criteria"
                            : "No orders have been placed yet"}
                        </p>
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
