"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconEye, IconX, IconCalendar } from "@tabler/icons-react"

interface Booking {
  id: string
  name: string
  email: string
  eventTitle: string
  date: string
  status: "confirmed" | "pending" | "cancelled"
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      eventTitle: "Wedding Photography",
      date: "2024-03-15",
      status: "confirmed"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      eventTitle: "Portrait Session",
      date: "2024-03-20",
      status: "pending"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      eventTitle: "Corporate Event",
      date: "2024-03-25",
      status: "confirmed"
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      eventTitle: "Family Photos",
      date: "2024-03-30",
      status: "cancelled"
    },
    {
      id: "5",
      name: "David Brown",
      email: "david@example.com",
      eventTitle: "Product Photography",
      date: "2024-04-05",
      status: "pending"
    }
  ])

  const handleCancel = (id: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id 
        ? { ...booking, status: "cancelled" as const }
        : booking
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
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
                  <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {bookings.length} total bookings
                    </span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Confirmed</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {bookings.filter(b => b.status === "confirmed").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Pending</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {bookings.filter(b => b.status === "pending").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Cancelled</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {bookings.filter(b => b.status === "cancelled").length}
                      </p>
                    </CardContent>
                  </Card>
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
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.name}</TableCell>
                            <TableCell>{booking.email}</TableCell>
                            <TableCell>{booking.eventTitle}</TableCell>
                            <TableCell>{formatDate(booking.date)}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <IconEye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {booking.status !== "cancelled" && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleCancel(booking.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <IconX className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 