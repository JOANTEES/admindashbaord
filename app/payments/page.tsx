"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  IconEye,
  IconPlus,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconCreditCard,
  IconReceipt,
  IconDownload,
  IconChevronDown,
  IconChevronRight,
  IconClock,
} from "@tabler/icons-react";
import { ProtectedRoute } from "@/components/protected-route";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface PaymentTransaction {
  amount: number;
  method: string;
  timestamp: string;
  notes?: string;
}

interface PaymentHistory {
  transactions: PaymentTransaction[];
}

interface Payment {
  id: string;
  booking_id?: string;
  order_id?: string;
  amount: number;
  currency: string;
  status:
    | "completed"
    | "pending"
    | "failed"
    | "refunded"
    | "cancelled"
    | "partial";
  method: "cash" | "bank_transfer" | "check" | "paystack";
  provider: "manual" | "paystack";
  payment_history?: PaymentHistory;
  booking_title?: string;
  booking_customer?: string;
  order_number?: string;
  order_customer?: string;
  created_at: string;
  // Legacy fields for backward compatibility
  bookingId?: string;
  customerName?: string;
  customerEmail?: string;
  eventTitle?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
  dueDate?: string;
  notes?: string;
  receiptNumber?: string;
  processedBy?: string;
}

// Helper functions for payment calculations
const calculateAmountPaid = (payment: Payment): number => {
  if (!payment.payment_history?.transactions) return 0;

  return payment.payment_history.transactions.reduce((total, transaction) => {
    return total + Number(transaction.amount || 0);
  }, 0);
};

const calculateRemainingAmount = (payment: Payment): number => {
  return payment.amount - calculateAmountPaid(payment);
};

const calculatePaymentProgress = (payment: Payment): number => {
  if (payment.amount === 0) return 0;
  return (calculateAmountPaid(payment) / payment.amount) * 100;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [partialPaymentData, setPartialPaymentData] = useState({
    amount: "",
    method: "cash" as "cash" | "bank_transfer" | "check" | "paystack",
    notes: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [sortBy, setSortBy] = useState<
    "date" | "amount" | "status" | "customer"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPaymentForPartial, setSelectedPaymentForPartial] =
    useState<Payment | null>(null);
  const [isPartialPaymentDialogOpen, setIsPartialPaymentDialogOpen] =
    useState(false);
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.getPayments();
        const payload = res.data as {
          payments?: Array<Record<string, unknown>>;
        };

        console.log("🔍 Raw API response:", res);
        console.log("🔍 Raw payment data from API:", payload.payments);

        // Let's examine one payment in detail to see what fields are available
        if (payload.payments && payload.payments.length > 0) {
          console.log(
            "🔍 Detailed examination of first payment:",
            payload.payments[0]
          );
          console.log("🔍 Available fields:", Object.keys(payload.payments[0]));
        }

        if (payload.payments) {
          const mapped: Payment[] = payload.payments.map((p) => {
            console.log(`🔍 Mapping payment ${p.id}:`, p);
            return {
              id: String(p.id ?? ""),
              booking_id: String(
                (p as { booking_id?: unknown }).booking_id ?? ""
              ),
              order_id: String((p as { order_id?: unknown }).order_id ?? ""),
              amount: Number((p as { amount?: unknown }).amount ?? 0),
              currency: String((p as { currency?: unknown }).currency ?? "GHS"),
              method: String(
                (p as { method?: unknown }).method ?? "cash"
              ) as Payment["method"],
              status: String(
                (p as { status?: unknown }).status ?? "pending"
              ) as Payment["status"],
              provider: String(
                (p as { provider?: unknown }).provider ?? "manual"
              ) as Payment["provider"],
              payment_history: (p as { payment_history?: unknown })
                .payment_history as PaymentHistory | undefined,
              booking_title: String(
                (p as { booking_title?: unknown }).booking_title ?? ""
              ),
              booking_customer: String(
                (p as { booking_customer?: unknown }).booking_customer ?? ""
              ),
              order_number: String(
                (p as { order_number?: unknown }).order_number ?? ""
              ),
              order_customer: String(
                (p as { order_customer?: unknown }).order_customer ?? ""
              ),
              created_at: String(
                (p as { created_at?: unknown }).created_at ?? ""
              ),
              // Legacy fields for backward compatibility
              bookingId: String(
                (p as { booking_id?: unknown }).booking_id ?? ""
              ),
              customerName: String(
                (p as { booking_customer?: unknown }).booking_customer ??
                  (p as { order_customer?: unknown }).order_customer ??
                  ""
              ),
              customerEmail: String(
                (p as { customer_email?: unknown }).customer_email ??
                  (p as { booking_email?: unknown }).booking_email ??
                  ""
              ),
              eventTitle: String(
                (p as { booking_title?: unknown }).booking_title ?? ""
              ),
              paymentMethod: String(
                (p as { method?: unknown }).method ?? "cash"
              ),
              transactionId: String(
                (p as { transaction_id?: unknown }).transaction_id ??
                  (p as { paystack_reference?: unknown }).paystack_reference ??
                  ""
              ),
              paymentDate: String(
                (p as { created_at?: unknown }).created_at ?? ""
              ),
              dueDate: "",
              notes: String((p as { notes?: unknown }).notes ?? ""),
              receiptNumber: "",
              processedBy: "",
            };
          });
          setPayments(mapped);
        } else {
          setPayments([]);
        }
      } catch (e) {
        console.error("Failed to load payments", e);
        toast.error("Failed to load payments");
      }
    };
    load();
  }, []);

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    const filtered = payments.filter((payment) => {
      const customerName =
        payment.customerName ||
        payment.booking_customer ||
        payment.order_customer ||
        "";
      const customerEmail = payment.customerEmail || "";
      const eventTitle = payment.eventTitle || payment.booking_title || "";
      const bookingId = payment.bookingId || payment.booking_id || "";
      const orderNumber = payment.order_number || "";

      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || payment.status === selectedStatus;
      const matchesPaymentMethod =
        selectedPaymentMethod === "all" ||
        payment.method === selectedPaymentMethod;
      return matchesSearch && matchesStatus && matchesPaymentMethod;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.created_at || a.paymentDate || "").getTime();
          bValue = new Date(b.created_at || b.paymentDate || "").getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "customer":
          aValue =
            a.customerName || a.booking_customer || a.order_customer || "";
          bValue =
            b.customerName || b.booking_customer || b.order_customer || "";
          break;
        default:
          aValue = new Date(a.created_at || a.paymentDate || "").getTime();
          bValue = new Date(b.created_at || b.paymentDate || "").getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    payments,
    searchTerm,
    selectedStatus,
    selectedPaymentMethod,
    sortBy,
    sortOrder,
  ]);

  const paymentMethods = ["cash", "bank_transfer", "check", "paystack"];
  const statuses = [
    "completed",
    "pending",
    "failed",
    "refunded",
    "cancelled",
    "partial",
  ];

  const handleAddPartialPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partialPaymentData.amount || !selectedPaymentForPartial) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const resp = await apiClient.addPartialPayment(
        selectedPaymentForPartial.id,
        {
          amount: parseFloat(partialPaymentData.amount),
          method: partialPaymentData.method,
          notes: partialPaymentData.notes || undefined,
        }
      );
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }

      toast.success("Partial payment added successfully");
      setIsPartialPaymentDialogOpen(false);
      setPartialPaymentData({ amount: "", method: "cash", notes: "" });
      setSelectedPaymentForPartial(null);

      // Reload payments to get updated data
      const res = await apiClient.getPayments();
      const payload = res.data as { payments?: Array<Record<string, unknown>> };
      if (payload.payments) {
        const mapped: Payment[] = payload.payments.map((p) => ({
          id: String(p.id ?? ""),
          booking_id: String((p as { booking_id?: unknown }).booking_id ?? ""),
          order_id: String((p as { order_id?: unknown }).order_id ?? ""),
          amount: Number((p as { amount?: unknown }).amount ?? 0),
          currency: String((p as { currency?: unknown }).currency ?? "GHS"),
          method: String(
            (p as { method?: unknown }).method ?? "cash"
          ) as Payment["method"],
          status: String(
            (p as { status?: unknown }).status ?? "pending"
          ) as Payment["status"],
          provider: String(
            (p as { provider?: unknown }).provider ?? "manual"
          ) as Payment["provider"],
          payment_history: (p as { payment_history?: unknown }).payment_history
            ? {
                transactions: (
                  (p as { payment_history?: { transactions?: unknown[] } })
                    .payment_history?.transactions || []
                ).map((tx: unknown) => ({
                  amount: Number((tx as { amount?: unknown }).amount || 0), // Ensure transaction amounts are numbers
                  method: String((tx as { method?: unknown }).method || "cash"),
                  timestamp: String(
                    (tx as { timestamp?: unknown }).timestamp || ""
                  ),
                  notes: (tx as { notes?: unknown }).notes
                    ? String((tx as { notes?: unknown }).notes)
                    : undefined,
                })),
              }
            : undefined,
          booking_title: String(
            (p as { booking_title?: unknown }).booking_title ?? ""
          ),
          booking_customer: String(
            (p as { booking_customer?: unknown }).booking_customer ?? ""
          ),
          order_number: String(
            (p as { order_number?: unknown }).order_number ?? ""
          ),
          order_customer: String(
            (p as { order_customer?: unknown }).order_customer ?? ""
          ),
          created_at: String((p as { created_at?: unknown }).created_at ?? ""),
          // Legacy fields for backward compatibility
          bookingId: String((p as { booking_id?: unknown }).booking_id ?? ""),
          customerName: String(
            (p as { booking_customer?: unknown }).booking_customer ??
              (p as { order_customer?: unknown }).order_customer ??
              ""
          ),
          customerEmail: String(
            (p as { customer_email?: unknown }).customer_email ??
              (p as { booking_email?: unknown }).booking_email ??
              ""
          ),
          eventTitle: String(
            (p as { booking_title?: unknown }).booking_title ?? ""
          ),
          paymentMethod: String((p as { method?: unknown }).method ?? "cash"),
          transactionId: String(
            (p as { transaction_id?: unknown }).transaction_id ??
              (p as { paystack_reference?: unknown }).paystack_reference ??
              ""
          ),
          paymentDate: String((p as { created_at?: unknown }).created_at ?? ""),
          dueDate: "",
          notes: String((p as { notes?: unknown }).notes ?? ""),
          receiptNumber: "",
          processedBy: "",
        }));
        setPayments(mapped);
      }
    } catch (error) {
      console.error("Failed to add partial payment", error);
      toast.error("Failed to add partial payment");
    }
  };

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    status: Payment["status"]
  ) => {
    try {
      const resp = await apiClient.updatePaymentStatus(
        paymentId,
        status as
          | "completed"
          | "pending"
          | "failed"
          | "refunded"
          | "cancelled"
          | "partial"
      );
      const possibleError = (resp as unknown as { error?: string }).error;
      if (possibleError) {
        let message = possibleError;
        try {
          const parsed = JSON.parse(possibleError) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
        throw new Error(message);
      }
      toast.success("Payment status updated successfully");

      // Reload payments to get updated data
      const res = await apiClient.getPayments();
      const payload = res.data as { payments?: Array<Record<string, unknown>> };
      if (payload.payments) {
        const mapped: Payment[] = payload.payments.map((p) => ({
          id: String(p.id ?? ""),
          booking_id: String((p as { booking_id?: unknown }).booking_id ?? ""),
          order_id: String((p as { order_id?: unknown }).order_id ?? ""),
          amount: Number((p as { amount?: unknown }).amount ?? 0),
          currency: String((p as { currency?: unknown }).currency ?? "GHS"),
          method: String(
            (p as { method?: unknown }).method ?? "cash"
          ) as Payment["method"],
          status: String(
            (p as { status?: unknown }).status ?? "pending"
          ) as Payment["status"],
          provider: String(
            (p as { provider?: unknown }).provider ?? "manual"
          ) as Payment["provider"],
          payment_history: (p as { payment_history?: unknown }).payment_history
            ? {
                transactions: (
                  (p as { payment_history?: { transactions?: unknown[] } })
                    .payment_history?.transactions || []
                ).map((tx: unknown) => ({
                  amount: Number((tx as { amount?: unknown }).amount || 0), // Ensure transaction amounts are numbers
                  method: String((tx as { method?: unknown }).method || "cash"),
                  timestamp: String(
                    (tx as { timestamp?: unknown }).timestamp || ""
                  ),
                  notes: (tx as { notes?: unknown }).notes
                    ? String((tx as { notes?: unknown }).notes)
                    : undefined,
                })),
              }
            : undefined,
          booking_title: String(
            (p as { booking_title?: unknown }).booking_title ?? ""
          ),
          booking_customer: String(
            (p as { booking_customer?: unknown }).booking_customer ?? ""
          ),
          order_number: String(
            (p as { order_number?: unknown }).order_number ?? ""
          ),
          order_customer: String(
            (p as { order_customer?: unknown }).order_customer ?? ""
          ),
          created_at: String((p as { created_at?: unknown }).created_at ?? ""),
          // Legacy fields for backward compatibility
          bookingId: String((p as { booking_id?: unknown }).booking_id ?? ""),
          customerName: String(
            (p as { booking_customer?: unknown }).booking_customer ??
              (p as { order_customer?: unknown }).order_customer ??
              ""
          ),
          customerEmail: String(
            (p as { customer_email?: unknown }).customer_email ??
              (p as { booking_email?: unknown }).booking_email ??
              ""
          ),
          eventTitle: String(
            (p as { booking_title?: unknown }).booking_title ?? ""
          ),
          paymentMethod: String((p as { method?: unknown }).method ?? "cash"),
          transactionId: String(
            (p as { transaction_id?: unknown }).transaction_id ??
              (p as { paystack_reference?: unknown }).paystack_reference ??
              ""
          ),
          paymentDate: String((p as { created_at?: unknown }).created_at ?? ""),
          dueDate: "",
          notes: String((p as { notes?: unknown }).notes ?? ""),
          receiptNumber: "",
          processedBy: "",
        }));
        setPayments(mapped);
      }
    } catch (error) {
      console.error("Failed to update payment status", error);
      toast.error("Failed to update payment status");
    }
  };

  const openPartialPaymentDialog = (payment: Payment) => {
    setSelectedPaymentForPartial(payment);
    setIsPartialPaymentDialogOpen(true);
  };

  const togglePaymentExpansion = (paymentId: string) => {
    const newExpanded = new Set(expandedPayments);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedPayments(newExpanded);
  };

  // Use the helper functions defined above

  const formatPaymentHistory = (payment: Payment) => {
    if (
      !payment.payment_history?.transactions ||
      payment.payment_history.transactions.length === 0
    ) {
      return (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">No payment history available</p>
        </div>
      );
    }

    return (
      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
          <IconClock className="h-4 w-4" />
          Payment History ({payment.payment_history.transactions.length}{" "}
          transaction
          {payment.payment_history.transactions.length !== 1 ? "s" : ""})
        </h4>
        <div className="space-y-3">
          {payment.payment_history.transactions.map((transaction, index) => (
            <div
              key={index}
              className="flex justify-between items-start p-3 bg-white rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-600">
                    ₵{Number(transaction.amount).toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {transaction.method.replace("_", " ")}
                  </Badge>
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(transaction.timestamp).toLocaleString()}
                </div>
                {transaction.notes && (
                  <div className="text-gray-600 text-xs mt-1 italic">
                    &ldquo;{transaction.notes}&rdquo;
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-semibold text-blue-800">
                Total Paid: ₵{calculateAmountPaid(payment).toFixed(2)}
              </div>
              <div className="text-xs text-blue-600">
                Out of ₵{payment.amount.toFixed(2)} total
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-800">
                {calculatePaymentProgress(payment).toFixed(1)}% Complete
              </div>
              {calculateRemainingAmount(payment) > 0 && (
                <div className="text-xs text-orange-600">
                  ₵{calculateRemainingAmount(payment).toFixed(2)} remaining
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "partial":
        return <Badge className="bg-orange-500">Partial</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-blue-500">Refunded</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-green-600">
            Cash
          </Badge>
        );
      case "bank_transfer":
        return (
          <Badge variant="outline" className="text-purple-600">
            Bank Transfer
          </Badge>
        );
      case "check":
        return (
          <Badge variant="outline" className="text-gray-600">
            Check
          </Badge>
        );
      case "paystack":
        return (
          <Badge variant="outline" className="text-blue-600">
            Paystack
          </Badge>
        );
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not paid";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPayments = payments.length;
  const completedPayments = payments.filter(
    (p) => p.status === "completed"
  ).length;
  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

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
                        Payments Manager
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Track and manage all payment transactions
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <IconDownload className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Payments
                        </CardTitle>
                        <IconReceipt className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {totalPayments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          payment records
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Completed
                        </CardTitle>
                        <IconReceipt className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                          {completedPayments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          successful payments
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Revenue
                        </CardTitle>
                        <IconCreditCard className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                          ₵{totalRevenue.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          completed payments
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Pending Amount
                        </CardTitle>
                        <IconCreditCard className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                          ₵{pendingAmount.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          awaiting payment
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select
                        value={sortBy}
                        onValueChange={(
                          value: "date" | "amount" | "status" | "customer"
                        ) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <IconSortAscending className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="amount">Amount</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                      >
                        {sortOrder === "asc" ? (
                          <IconSortAscending className="h-4 w-4" />
                        ) : (
                          <IconSortDescending className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Payments Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Event/Order</TableHead>
                            <TableHead>Payment Details</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedPayments.map((payment) => (
                            <Fragment key={payment.id}>
                              <TableRow>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {payment.bookingId || payment.order_id}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {payment.transactionId}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {payment.receiptNumber}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {payment.customerName ||
                                        payment.booking_customer ||
                                        payment.order_customer}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {payment.customerEmail}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-muted-foreground">
                                    {payment.eventTitle ||
                                      payment.booking_title ||
                                      payment.order_number}
                                  </div>
                                  {payment.booking_id && (
                                    <div className="text-xs text-blue-600">
                                      Booking: {payment.booking_id}
                                    </div>
                                  )}
                                  {payment.order_id && (
                                    <div className="text-xs text-green-600">
                                      Order: {payment.order_id}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {/* Total Due */}
                                    <div className="font-medium text-sm">
                                      Total Due: ₵{payment.amount.toFixed(2)}
                                    </div>

                                    {/* Amount Paid */}
                                    <div className="text-sm text-green-600">
                                      Paid: ₵
                                      {calculateAmountPaid(payment).toFixed(2)}
                                    </div>

                                    {/* Remaining Amount */}
                                    {calculateRemainingAmount(payment) > 0 && (
                                      <div className="text-sm text-orange-600">
                                        Remaining: ₵
                                        {calculateRemainingAmount(
                                          payment
                                        ).toFixed(2)}
                                      </div>
                                    )}

                                    {/* Payment Progress */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.min(
                                            calculatePaymentProgress(payment),
                                            100
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {calculatePaymentProgress(
                                        payment
                                      ).toFixed(1)}
                                      % Complete
                                    </div>

                                    {/* Progress Bar - Show for all payments with transactions */}
                                    {payment.payment_history?.transactions &&
                                      payment.payment_history.transactions
                                        .length > 0 && (
                                        <div className="mt-2">
                                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>
                                              {Math.round(
                                                calculatePaymentProgress(
                                                  payment
                                                )
                                              )}
                                              %
                                            </span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                              className={`h-2 rounded-full transition-all duration-300 ${
                                                calculatePaymentProgress(
                                                  payment
                                                ) === 100
                                                  ? "bg-green-500"
                                                  : "bg-blue-600"
                                              }`}
                                              style={{
                                                width: `${calculatePaymentProgress(
                                                  payment
                                                )}%`,
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getPaymentMethodBadge(payment.method)}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(payment.status)}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="text-sm font-medium">
                                      {formatDate(
                                        payment.created_at ||
                                          payment.paymentDate ||
                                          ""
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {payment.provider === "paystack"
                                        ? "Online"
                                        : "Manual"}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <IconEye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        openPartialPaymentDialog(payment)
                                      }
                                      className="text-blue-600 hover:text-blue-700"
                                      title="Add partial payment"
                                    >
                                      <IconPlus className="h-4 w-4" />
                                    </Button>
                                    {/* Show history toggle button if there are transactions */}
                                    {payment.payment_history?.transactions &&
                                      payment.payment_history.transactions
                                        .length > 0 && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            togglePaymentExpansion(payment.id)
                                          }
                                          className="text-purple-600 hover:text-purple-700"
                                          title="View payment history"
                                        >
                                          {expandedPayments.has(payment.id) ? (
                                            <IconChevronDown className="h-4 w-4" />
                                          ) : (
                                            <IconChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                    {payment.status !== "completed" &&
                                      payment.status !== "cancelled" && (
                                        <Select
                                          value={payment.status}
                                          onValueChange={(
                                            value: Payment["status"]
                                          ) =>
                                            handleUpdatePaymentStatus(
                                              payment.id,
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-[100px] h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {statuses.map((status) => (
                                              <SelectItem
                                                key={status}
                                                value={status}
                                              >
                                                {status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  status.slice(1)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                  </div>
                                </TableCell>
                              </TableRow>
                              {expandedPayments.has(payment.id) && (
                                <TableRow>
                                  <TableCell colSpan={8} className="p-0">
                                    <div className="p-4 bg-gray-50 border-t">
                                      {formatPaymentHistory(payment)}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {filteredAndSortedPayments.length === 0 && (
                    <div className="text-center py-12">
                      <IconReceipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        No payments found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Partial Payment Dialog */}
      <Dialog
        open={isPartialPaymentDialogOpen}
        onOpenChange={setIsPartialPaymentDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Partial Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPartialPayment} className="space-y-4">
            {selectedPaymentForPartial && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {selectedPaymentForPartial.customerName ||
                      selectedPaymentForPartial.booking_customer ||
                      selectedPaymentForPartial.order_customer}
                  </p>
                  <p>
                    <strong>Total Due:</strong> ₵
                    {selectedPaymentForPartial.amount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₵
                    {calculateAmountPaid(selectedPaymentForPartial).toFixed(2)}
                  </p>
                  <p>
                    <strong>Remaining:</strong> ₵
                    {calculateRemainingAmount(
                      selectedPaymentForPartial
                    ).toFixed(2)}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedPaymentForPartial.status}
                  </p>
                  {selectedPaymentForPartial.booking_title && (
                    <p>
                      <strong>Booking:</strong>{" "}
                      {selectedPaymentForPartial.booking_title}
                    </p>
                  )}
                  {selectedPaymentForPartial.order_number && (
                    <p>
                      <strong>Order:</strong>{" "}
                      {selectedPaymentForPartial.order_number}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partialAmount">Amount (₵) *</Label>
                <Input
                  id="partialAmount"
                  type="number"
                  step="0.01"
                  value={partialPaymentData.amount}
                  onChange={(e) =>
                    setPartialPaymentData({
                      ...partialPaymentData,
                      amount: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partialMethod">Payment Method *</Label>
                <Select
                  value={partialPaymentData.method}
                  onValueChange={(value) =>
                    setPartialPaymentData({
                      ...partialPaymentData,
                      method: value as
                        | "cash"
                        | "bank_transfer"
                        | "check"
                        | "paystack",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partialNotes">Notes</Label>
              <Input
                id="partialNotes"
                value={partialPaymentData.notes}
                onChange={(e) =>
                  setPartialPaymentData({
                    ...partialPaymentData,
                    notes: e.target.value,
                  })
                }
                placeholder="Optional notes about this payment"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Payment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPartialPaymentDialogOpen(false);
                  setSelectedPaymentForPartial(null);
                  setPartialPaymentData({
                    amount: "",
                    method: "cash",
                    notes: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
