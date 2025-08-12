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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconEye, IconX, IconCalendar, IconPlus, IconSearch, IconFilter, IconSortAscending, IconSortDescending } from "@tabler/icons-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  eventTitle: string
  eventType: string
  date: string
  time: string
  duration: number
  location: string
  price: number
  status: "confirmed" | "pending" | "cancelled" | "completed"
  paymentStatus: "paid" | "pending" | "partial"
  notes: string
  createdAt: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+233 24 123 4567",
      eventTitle: "Annual Company Conference",
      eventType: "Corporate",
      date: "2024-03-15",
      time: "09:00",
      duration: 8,
      location: "Accra, Ghana",
      price: 2500.00,
      status: "confirmed",
      paymentStatus: "paid",
      notes: "Annual company conference with 200 attendees",
      createdAt: "2024-02-15"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+233 20 987 6543",
      eventTitle: "Wedding Reception",
      eventType: "Wedding",
      date: "2024-03-20",
      time: "14:00",
      duration: 6,
      location: "Kumasi, Ghana",
      price: 5000.00,
      status: "pending",
      paymentStatus: "pending",
      notes: "Wedding reception for 150 guests",
      createdAt: "2024-02-20"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+233 26 555 1234",
      eventTitle: "Product Launch",
      eventType: "Corporate",
      date: "2024-03-25",
      time: "10:00",
      duration: 4,
      location: "Tema, Ghana",
      price: 1800.00,
      status: "confirmed",
      paymentStatus: "partial",
      notes: "New product launch event",
      createdAt: "2024-02-25"
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      phone: "+233 54 789 0123",
      eventTitle: "Birthday Party",
      eventType: "Social",
      date: "2024-03-30",
      time: "16:00",
      duration: 4,
      location: "Cape Coast, Ghana",
      price: 750.00,
      status: "cancelled",
      paymentStatus: "pending",
      notes: "50th birthday celebration",
      createdAt: "2024-03-01"
    },
    {
      id: "5",
      name: "David Brown",
      email: "david@example.com",
      phone: "+233 27 456 7890",
      eventTitle: "Charity Fundraiser",
      eventType: "Charity",
      date: "2024-04-05",
      time: "11:00",
      duration: 5,
      location: "Accra, Ghana",
      price: 1200.00,
      status: "pending",
      paymentStatus: "pending",
      notes: "Annual charity fundraising event",
      createdAt: "2024-03-05"
    }
  ])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventTitle: "",
    eventType: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    price: "",
    notes: ""
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEventType, setSelectedEventType] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "date" | "price" | "status">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    const filtered = bookings.filter(booking => {
      const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus
      const matchesEventType = selectedEventType === "all" || booking.eventType === selectedEventType
      return matchesSearch && matchesStatus && matchesEventType
    })

    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "date":
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [bookings, searchTerm, selectedStatus, selectedEventType, sortBy, sortOrder])

  const eventTypes = ["Wedding", "Corporate", "Social", "Charity", "Conference", "Seminar", "Workshop", "Other"]
  const statuses = ["confirmed", "pending", "cancelled", "completed"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.eventTitle || !formData.date || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      eventTitle: formData.eventTitle,
      eventType: formData.eventType,
      date: formData.date,
      time: formData.time,
      duration: formData.duration ? parseInt(formData.duration) : 2,
      location: formData.location,
      price: parseFloat(formData.price),
      status: "pending",
      paymentStatus: "pending",
      notes: formData.notes,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setBookings([...bookings, newBooking])
    setFormData({ name: "", email: "", phone: "", eventTitle: "", eventType: "", date: "", time: "", duration: "", location: "", price: "", notes: "" })
    setIsDialogOpen(false)
    toast.success("Booking added successfully!")
  }

  const handleStatusChange = (id: string, newStatus: Booking["status"]) => {
    setBookings(bookings.map(booking => 
      booking.id === id 
        ? { ...booking, status: newStatus }
        : booking
    ))
    toast.success(`Booking status updated to ${newStatus}`)
  }

  const handleDelete = (id: string) => {
    setBookings(bookings.filter(booking => booking.id !== id))
    toast.success("Booking deleted successfully!")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "partial":
        return <Badge className="bg-orange-500">Partial</Badge>
      default:
        return <Badge>{paymentStatus}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length
  const totalRevenue = bookings.filter(b => b.paymentStatus === "paid").reduce((sum, b) => sum + b.price, 0)
  const pendingRevenue = bookings.filter(b => b.paymentStatus === "pending").reduce((sum, b) => sum + b.price, 0)

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
                      <h1 className="text-3xl font-bold text-foreground">Bookings Manager</h1>
                      <p className="text-muted-foreground mt-1">Manage your event bookings</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <IconPlus className="h-4 w-4" />
                          Add New Booking
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Booking</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name *</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="eventTitle">Event Title *</Label>
                              <Input
                                id="eventTitle"
                                value={formData.eventTitle}
                                onChange={(e) => setFormData({...formData, eventTitle: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="eventType">Event Type</Label>
                              <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {eventTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price">Price (₵) *</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="date">Date *</Label>
                              <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="time">Time</Label>
                              <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="duration">Duration (hours)</Label>
                              <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                placeholder="2"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={formData.notes}
                              onChange={(e) => setFormData({...formData, notes: e.target.value})}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">Add Booking</Button>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalBookings}</div>
                        <p className="text-xs text-muted-foreground">all bookings</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                        <IconCalendar className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">{confirmedBookings}</div>
                        <p className="text-xs text-muted-foreground">confirmed bookings</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IconCalendar className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-500">₵{totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">paid bookings</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                        <IconCalendar className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">₵{pendingRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">unpaid bookings</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search bookings..."
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
                    <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {eventTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={(value: "name" | "date" | "price" | "status") => setSortBy(value)}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <IconSortAscending className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
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

                  {/* Bookings Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>All Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{booking.name}</div>
                                  <div className="text-sm text-muted-foreground">{booking.email}</div>
                                  {booking.phone && (
                                    <div className="text-sm text-muted-foreground">{booking.phone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{booking.eventTitle}</div>
                                  <Badge variant="outline" className="text-xs">{booking.eventType}</Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{formatDate(booking.date)}</div>
                                  {booking.time && (
                                    <div className="text-sm text-muted-foreground">{booking.time} ({booking.duration}h)</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">{booking.location}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">₵{booking.price.toFixed(2)}</div>
                              </TableCell>
                              <TableCell>{getStatusBadge(booking.status)}</TableCell>
                              <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <IconEye className="h-4 w-4" />
                                  </Button>
                                  {booking.status !== "cancelled" && (
                                    <Select value={booking.status} onValueChange={(value: Booking["status"]) => handleStatusChange(booking.id, value)}>
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
                                    onClick={() => handleDelete(booking.id)}
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

                  {filteredAndSortedBookings.length === 0 && (
                    <div className="text-center py-12">
                      <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No bookings found</h3>
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