"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconEye, IconX, IconPlus, IconSearch, IconFilter, IconSortAscending, IconSortDescending, IconCreditCard, IconReceipt, IconDownload } from "@tabler/icons-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface Payment {
  id: string
  bookingId: string
  customerName: string
  customerEmail: string
  eventTitle: string
  amount: number
  currency: string
  paymentMethod: "cash" | "mobile_money" | "bank_transfer" | "card" | "check"
  status: "completed" | "pending" | "failed" | "refunded" | "cancelled"
  transactionId: string
  paymentDate: string
  dueDate: string
  notes: string
  receiptNumber: string
  processedBy: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      bookingId: "BK001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      eventTitle: "Annual Company Conference",
      amount: 2500.00,
      currency: "GHS",
      paymentMethod: "bank_transfer",
      status: "completed",
      transactionId: "TXN-2024-001",
      paymentDate: "2024-03-10T14:30:00Z",
      dueDate: "2024-03-15",
      notes: "Full payment received",
      receiptNumber: "RCP-2024-001",
      processedBy: "Admin User"
    },
    {
      id: "2",
      bookingId: "BK002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      eventTitle: "Wedding Reception",
      amount: 5000.00,
      currency: "GHS",
      paymentMethod: "mobile_money",
      status: "pending",
      transactionId: "TXN-2024-002",
      paymentDate: "",
      dueDate: "2024-03-20",
      notes: "Awaiting payment confirmation",
      receiptNumber: "RCP-2024-002",
      processedBy: "John Manager"
    },
    {
      id: "3",
      bookingId: "BK003",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      eventTitle: "Product Launch",
      amount: 1800.00,
      currency: "GHS",
      paymentMethod: "cash",
      status: "completed",
      transactionId: "TXN-2024-003",
      paymentDate: "2024-03-08T10:15:00Z",
      dueDate: "2024-03-25",
      notes: "Cash payment received",
      receiptNumber: "RCP-2024-003",
      processedBy: "Sarah Staff"
    },
    {
      id: "4",
      bookingId: "BK004",
      customerName: "Sarah Wilson",
      customerEmail: "sarah@example.com",
      eventTitle: "Birthday Party",
      amount: 750.00,
      currency: "GHS",
      paymentMethod: "card",
      status: "failed",
      transactionId: "TXN-2024-004",
      paymentDate: "",
      dueDate: "2024-03-30",
      notes: "Card declined - insufficient funds",
      receiptNumber: "RCP-2024-004",
      processedBy: "David Staff"
    },
    {
      id: "5",
      bookingId: "BK005",
      customerName: "David Brown",
      customerEmail: "david@example.com",
      eventTitle: "Charity Fundraiser",
      amount: 1200.00,
      currency: "GHS",
      paymentMethod: "check",
      status: "pending",
      transactionId: "TXN-2024-005",
      paymentDate: "",
      dueDate: "2024-04-05",
      notes: "Check received, pending clearance",
      receiptNumber: "RCP-2024-005",
      processedBy: "Admin User"
    }
  ])

  const [formData, setFormData] = useState({
    bookingId: "",
    customerName: "",
    customerEmail: "",
    eventTitle: "",
    amount: "",
    paymentMethod: "",
    dueDate: "",
    notes: ""
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status" | "customer">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    const filtered = payments.filter(payment => {
      const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || payment.status === selectedStatus
      const matchesPaymentMethod = selectedPaymentMethod === "all" || payment.paymentMethod === selectedPaymentMethod
      return matchesSearch && matchesStatus && matchesPaymentMethod
    })

    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "date":
          aValue = new Date(a.paymentDate || a.dueDate).getTime()
          bValue = new Date(b.paymentDate || b.dueDate).getTime()
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "customer":
          aValue = a.customerName
          bValue = b.customerName
          break
        default:
          aValue = new Date(a.paymentDate || a.dueDate).getTime()
          bValue = new Date(b.paymentDate || b.dueDate).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [payments, searchTerm, selectedStatus, selectedPaymentMethod, sortBy, sortOrder])

  const paymentMethods = ["cash", "mobile_money", "bank_transfer", "card", "check"]
  const statuses = ["completed", "pending", "failed", "refunded", "cancelled"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.bookingId || !formData.customerName || !formData.amount || !formData.paymentMethod) {
      toast.error("Please fill in all required fields")
      return
    }

    const newPayment: Payment = {
      id: Date.now().toString(),
      bookingId: formData.bookingId,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      eventTitle: formData.eventTitle,
      amount: parseFloat(formData.amount),
      currency: "GHS",
      paymentMethod: formData.paymentMethod as Payment["paymentMethod"],
      status: "pending",
      transactionId: `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      paymentDate: "",
      dueDate: formData.dueDate,
      notes: formData.notes,
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      processedBy: "Current User"
    }

    setPayments([...payments, newPayment])
    setFormData({ bookingId: "", customerName: "", customerEmail: "", eventTitle: "", amount: "", paymentMethod: "", dueDate: "", notes: "" })
    setIsDialogOpen(false)
    toast.success("Payment record created successfully!")
  }

  const handleStatusChange = (id: string, newStatus: Payment["status"]) => {
    setPayments(payments.map(payment => 
      payment.id === id 
        ? { 
            ...payment, 
            status: newStatus,
            paymentDate: newStatus === "completed" ? new Date().toISOString() : payment.paymentDate
          }
        : payment
    ))
    toast.success(`Payment status updated to ${newStatus}`)
  }

  const handleDelete = (id: string) => {
    setPayments(payments.filter(payment => payment.id !== id))
    toast.success("Payment record deleted successfully!")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "refunded":
        return <Badge className="bg-blue-500">Refunded</Badge>
      case "cancelled":
        return <Badge className="bg-gray-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="outline" className="text-green-600">Cash</Badge>
      case "mobile_money":
        return <Badge variant="outline" className="text-blue-600">Mobile Money</Badge>
      case "bank_transfer":
        return <Badge variant="outline" className="text-purple-600">Bank Transfer</Badge>
      case "card":
        return <Badge variant="outline" className="text-orange-600">Card</Badge>
      case "check":
        return <Badge variant="outline" className="text-gray-600">Check</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not paid"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPayments = payments.length
  const completedPayments = payments.filter(p => p.status === "completed").length
  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

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
                      <h1 className="text-3xl font-bold text-foreground">Payments Manager</h1>
                      <p className="text-muted-foreground mt-1">Track and manage all payment transactions</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <IconDownload className="h-4 w-4" />
                        Export
                      </Button>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2">
                            <IconPlus className="h-4 w-4" />
                            Add Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New Payment Record</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="bookingId">Booking ID *</Label>
                                <Input
                                  id="bookingId"
                                  value={formData.bookingId}
                                  onChange={(e) => setFormData({...formData, bookingId: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₵) *</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  step="0.01"
                                  value={formData.amount}
                                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name *</Label>
                                <Input
                                  id="customerName"
                                  value={formData.customerName}
                                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="customerEmail">Customer Email</Label>
                                <Input
                                  id="customerEmail"
                                  type="email"
                                  value={formData.customerEmail}
                                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="eventTitle">Event Title</Label>
                              <Input
                                id="eventTitle"
                                value={formData.eventTitle}
                                onChange={(e) => setFormData({...formData, eventTitle: e.target.value})}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method *</Label>
                                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentMethods.map(method => (
                                      <SelectItem key={method} value={method}>
                                        {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                  id="dueDate"
                                  type="date"
                                  value={formData.dueDate}
                                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                              />
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button type="submit" className="flex-1">Add Payment</Button>
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                        <IconReceipt className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalPayments}</div>
                        <p className="text-xs text-muted-foreground">payment records</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <IconReceipt className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">{completedPayments}</div>
                        <p className="text-xs text-muted-foreground">successful payments</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IconCreditCard className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-500">₵{totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">completed payments</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                        <IconCreditCard className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">₵{pendingAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">awaiting payment</p>
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
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={(value: "date" | "amount" | "status" | "customer") => setSortBy(value)}>
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
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        {sortOrder === "asc" ? <IconSortAscending className="h-4 w-4" /> : <IconSortDescending className="h-4 w-4" />}
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
                            <TableHead>Event</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{payment.bookingId}</div>
                                  <div className="text-sm text-muted-foreground">{payment.transactionId}</div>
                                  <div className="text-xs text-muted-foreground">{payment.receiptNumber}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{payment.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{payment.customerEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">{payment.eventTitle}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">₵{payment.amount.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">{payment.currency}</div>
                              </TableCell>
                              <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm font-medium">{formatDate(payment.paymentDate)}</div>
                                  <div className="text-xs text-muted-foreground">Due: {formatDate(payment.dueDate)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <IconEye className="h-4 w-4" />
                                  </Button>
                                  {payment.status !== "completed" && payment.status !== "cancelled" && (
                                    <Select value={payment.status} onValueChange={(value: Payment["status"]) => handleStatusChange(payment.id, value)}>
                                      <SelectTrigger className="w-[100px] h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {statuses.map(status => (
                                          <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDelete(payment.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <IconX className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {filteredAndSortedPayments.length === 0 && (
                    <div className="text-center py-12">
                      <IconReceipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No payments found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
} 