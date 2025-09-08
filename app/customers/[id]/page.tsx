"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconShoppingBag,
  IconStar,
  IconEdit,
  IconMessage,
  IconTrendingUp,
  IconUser,
  IconArrowLeft,
  IconCreditCard,
  IconPackage,
} from "@tabler/icons-react"
import { Customer, PurchaseHistory } from "@/lib/types/customer"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"

// Mock data - replace with actual API calls
const mockCustomer: Customer = {
  id: "1",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1990-05-15",
  gender: "female",
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  preferences: {
    size: ["M", "L"],
    colors: ["black", "white", "navy"],
    brands: ["Nike", "Adidas"],
    categories: ["t-shirts", "hoodies"],
    priceRange: { min: 20, max: 100 },
    communication: { email: true, sms: true, push: false }
  },
  loyaltyPoints: 1250,
  loyaltyTier: "gold",
  totalSpent: 1250.00,
  totalOrders: 15,
  averageOrderValue: 83.33,
  lastPurchaseDate: "2024-01-15",
  registrationDate: "2023-06-01",
  status: "active",
  tags: ["frequent_buyer", "vip"],
  notes: "Prefers eco-friendly products",
  avatar: "/avatars/sarah.jpg"
}

const mockPurchaseHistory: PurchaseHistory[] = [
  {
    id: "1",
    customerId: "1",
    orderDate: "2024-01-15",
    items: [
      {
        id: "1",
        name: "Classic Cotton T-Shirt",
        size: "M",
        color: "Black",
        price: 29.99,
        quantity: 2,
        image: "/products/tshirt-black.jpg"
      },
      {
        id: "2",
        name: "Athletic Hoodie",
        size: "L",
        color: "Navy",
        price: 59.99,
        quantity: 1,
        image: "/products/hoodie-navy.jpg"
      }
    ],
    totalAmount: 119.97,
    status: "completed",
    paymentMethod: "Credit Card",
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    }
  },
  {
    id: "2",
    customerId: "1",
    orderDate: "2023-12-20",
    items: [
      {
        id: "3",
        name: "Premium Polo Shirt",
        size: "M",
        color: "White",
        price: 39.99,
        quantity: 1,
        image: "/products/polo-white.jpg"
      }
    ],
    totalAmount: 39.99,
    status: "completed",
    paymentMethod: "PayPal",
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    }
  }
]

const mockActivity = [
  {
    id: "1",
    type: "purchase",
    description: "Made a purchase of ₵119.97",
    timestamp: "2024-01-15T10:30:00Z",
    metadata: { orderId: "1", items: 3 }
  },
  {
    id: "2",
    type: "email_open",
    description: "Opened promotional email",
    timestamp: "2024-01-14T14:20:00Z",
    metadata: { campaignId: "winter-sale" }
  },
  {
    id: "3",
    type: "loyalty_earned",
    description: "Earned 120 loyalty points",
    timestamp: "2024-01-15T10:30:00Z",
    metadata: { points: 120, orderId: "1" }
  },
  {
    id: "4",
    type: "login",
    description: "Logged into account",
    timestamp: "2024-01-13T09:15:00Z",
    metadata: { ip: "192.168.1.1" }
  }
]

export default function CustomerProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "bg-amber-100 text-amber-800"
      case "silver": return "bg-gray-100 text-gray-800"
      case "gold": return "bg-yellow-100 text-yellow-800"
      case "platinum": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "suspended": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "refunded": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {mockCustomer.firstName} {mockCustomer.lastName}
            </h2>
            <p className="text-muted-foreground">Customer Profile</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <IconMessage className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline">
            <IconEdit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mockCustomer.avatar} />
              <AvatarFallback className="text-lg">
                {mockCustomer.firstName[0]}{mockCustomer.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h3 className="text-2xl font-semibold">
                  {mockCustomer.firstName} {mockCustomer.lastName}
                </h3>
                <Badge className={getLoyaltyTierColor(mockCustomer.loyaltyTier)}>
                  {mockCustomer.loyaltyTier.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(mockCustomer.status)}>
                  {mockCustomer.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mockCustomer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mockCustomer.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <IconMapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {mockCustomer.address.city}, {mockCustomer.address.state}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Member since {formatDate(mockCustomer.registrationDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <IconCreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{mockCustomer.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {mockCustomer.totalOrders} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <IconStar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomer.loyaltyPoints}</div>
            <p className="text-xs text-muted-foreground">
              {mockCustomer.loyaltyTier} tier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{mockCustomer.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last order: {mockCustomer.lastPurchaseDate ? formatDate(mockCustomer.lastPurchaseDate) : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Tags</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {mockCustomer.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchase-history">Purchase History</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{mockCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{mockCustomer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm">
                    {mockCustomer.address.street}<br />
                    {mockCustomer.address.city}, {mockCustomer.address.state} {mockCustomer.address.zipCode}<br />
                    {mockCustomer.address.country}
                  </p>
                </div>
                {mockCustomer.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-sm">{formatDate(mockCustomer.dateOfBirth)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Marketing</span>
                  <Badge variant={mockCustomer.preferences.communication.email ? "default" : "outline"}>
                    {mockCustomer.preferences.communication.email ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Notifications</span>
                  <Badge variant={mockCustomer.preferences.communication.sms ? "default" : "outline"}>
                    {mockCustomer.preferences.communication.sms ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  <Badge variant={mockCustomer.preferences.communication.push ? "default" : "outline"}>
                    {mockCustomer.preferences.communication.push ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {mockCustomer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{mockCustomer.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="purchase-history" className="space-y-4">
          <div className="space-y-4">
            {mockPurchaseHistory.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <CardDescription>
                        {formatDate(order.orderDate)} • {order.paymentMethod}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₵{order.totalAmount.toFixed(2)}</div>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <IconPackage className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.color} • Size {item.size} • Qty {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₵{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between text-sm">
                    <span>Shipping Address:</span>
                    <span>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Sizes</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mockCustomer.preferences.size.map((size) => (
                      <Badge key={size} variant="outline">{size}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Colors</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mockCustomer.preferences.colors.map((color) => (
                      <Badge key={color} variant="outline">{color}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Brands</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mockCustomer.preferences.brands.map((brand) => (
                      <Badge key={brand} variant="outline">{brand}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Categories</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mockCustomer.preferences.categories.map((category) => (
                      <Badge key={category} variant="outline">{category}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price Range</label>
                  <p className="text-sm mt-1">
                    ₵{mockCustomer.preferences.priceRange.min} - ₵{mockCustomer.preferences.priceRange.max}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {activity.type === "purchase" && <IconShoppingBag className="h-4 w-4" />}
                      {activity.type === "email_open" && <IconMail className="h-4 w-4" />}
                      {activity.type === "loyalty_earned" && <IconStar className="h-4 w-4" />}
                      {activity.type === "login" && <IconUser className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{mockCustomer.loyaltyPoints}</div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
                <div className="text-center">
                  <Badge className={getLoyaltyTierColor(mockCustomer.loyaltyTier)}>
                    {mockCustomer.loyaltyTier.toUpperCase()} TIER
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Points to Gold:</span>
                    <span>750 points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-muted-foreground">On any order</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">100 points</p>
                    <Button size="sm" variant="outline">Redeem</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">₵10 Off</p>
                    <p className="text-sm text-muted-foreground">Next order</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">200 points</p>
                    <Button size="sm" variant="outline">Redeem</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
