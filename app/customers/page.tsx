"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconShoppingBag,
  IconStar,
  IconTrendingUp,
  IconUsers,
  IconMessage,
  IconEdit,
  IconEye,
} from "@tabler/icons-react"
import { Customer, CustomerSegment, LoyaltyProgram } from "@/lib/types/customer"
import { ProtectedRoute } from "@/components/protected-route"

// Mock data - replace with actual API calls
const mockCustomers: Customer[] = [
  {
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
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 987-6543",
    dateOfBirth: "1985-12-03",
    gender: "male",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    preferences: {
      size: ["L", "XL"],
      colors: ["blue", "gray", "black"],
      brands: ["Under Armour", "Puma"],
      categories: ["shorts", "tanks"],
      priceRange: { min: 30, max: 150 },
      communication: { email: true, sms: false, push: true }
    },
    loyaltyPoints: 850,
    loyaltyTier: "silver",
    totalSpent: 850.00,
    totalOrders: 8,
    averageOrderValue: 106.25,
    lastPurchaseDate: "2024-01-10",
    registrationDate: "2023-08-15",
    status: "active",
    tags: ["athletic", "weekend_warrior"],
    notes: "Likes performance wear",
    avatar: "/avatars/michael.jpg"
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "+1 (555) 456-7890",
    dateOfBirth: "1992-08-22",
    gender: "female",
    address: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    preferences: {
      size: ["S", "M"],
      colors: ["pink", "purple", "white"],
      brands: ["Lululemon", "Athleta"],
      categories: ["yoga", "leggings"],
      priceRange: { min: 50, max: 200 },
      communication: { email: true, sms: true, push: true }
    },
    loyaltyPoints: 2100,
    loyaltyTier: "platinum",
    totalSpent: 2100.00,
    totalOrders: 25,
    averageOrderValue: 84.00,
    lastPurchaseDate: "2024-01-20",
    registrationDate: "2023-03-10",
    status: "active",
    tags: ["yoga_enthusiast", "premium_customer"],
    notes: "Yoga instructor, very active",
    avatar: "/avatars/emily.jpg"
  }
]

const mockSegments: CustomerSegment[] = [
  {
    id: "1",
    name: "Frequent Buyers",
    description: "Customers with 10+ orders",
    criteria: { totalOrders: { min: 10 } },
    customerCount: 45,
    createdAt: "2024-01-01"
  },
  {
    id: "2",
    name: "High Value Customers",
    description: "Customers who spent $500+",
    criteria: { totalSpent: { min: 500 } },
    customerCount: 23,
    createdAt: "2024-01-01"
  },
  {
    id: "3",
    name: "Inactive Customers",
    description: "No purchases in last 90 days",
    criteria: { lastPurchaseDays: 90 },
    customerCount: 67,
    createdAt: "2024-01-01"
  }
]

const mockLoyaltyProgram: LoyaltyProgram = {
  id: "1",
  name: "Q1 2024 Loyalty Program",
  description: "Quarterly loyalty program with tier-based rewards",
  type: "quarterly",
  startDate: "2024-01-01",
  endDate: "2024-03-31",
  tiers: [
    {
      name: "Bronze",
      minPoints: 0,
      benefits: ["5% discount on all orders"],
      discountPercentage: 5
    },
    {
      name: "Silver",
      minPoints: 500,
      benefits: ["10% discount", "Free shipping on orders $50+"],
      discountPercentage: 10
    },
    {
      name: "Gold",
      minPoints: 1000,
      benefits: ["15% discount", "Free shipping", "Early access to sales"],
      discountPercentage: 15
    },
    {
      name: "Platinum",
      minPoints: 2000,
      benefits: ["20% discount", "Free shipping", "Early access", "Personal stylist"],
      discountPercentage: 20
    }
  ],
  rewards: [
    {
      id: "1",
      name: "Free Shipping",
      description: "Free shipping on any order",
      pointsRequired: 100,
      type: "free_shipping",
      value: 0,
      isActive: true
    },
    {
      id: "2",
      name: "$10 Off",
      description: "$10 discount on your next order",
      pointsRequired: 200,
      type: "discount",
      value: 10,
      isActive: true
    }
  ],
  isActive: true
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSegment, setSelectedSegment] = useState<string>("all")

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedSegment === "all") return matchesSearch
    
    const segment = mockSegments.find(s => s.id === selectedSegment)
    if (!segment) return matchesSearch
    
    // Apply segment criteria
    if (segment.criteria.totalOrders?.min && customer.totalOrders < segment.criteria.totalOrders.min) return false
    if (segment.criteria.totalSpent?.min && customer.totalSpent < segment.criteria.totalSpent.min) return false
    if (segment.criteria.lastPurchaseDays && customer.lastPurchaseDate) {
      const daysSinceLastPurchase = Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastPurchase > segment.criteria.lastPurchaseDays) return false
    }
    
    return matchesSearch
  })

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

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCustomers.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
            <IconStar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCustomers.filter(c => c.loyaltyPoints > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <IconShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(mockCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / mockCustomers.length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <IconFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Segment Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Segment:</span>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Customers</option>
              {mockSegments.map(segment => (
                <option key={segment.id} value={segment.id}>
                  {segment.name} ({segment.customerCount})
                </option>
              ))}
            </select>
          </div>

          {/* Customer List */}
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>
                          {customer.firstName[0]}{customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getLoyaltyTierColor(customer.loyaltyTier)}>
                            {customer.loyaltyTier}
                          </Badge>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {customer.totalOrders} orders • ${customer.totalSpent.toFixed(2)} spent
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.loyaltyPoints} points
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconMessage className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Customer Segments</h3>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Segment
            </Button>
          </div>
          <div className="grid gap-4">
            {mockSegments.map((segment) => (
              <Card key={segment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{segment.name}</h4>
                      <p className="text-sm text-muted-foreground">{segment.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {segment.customerCount} customers
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconMessage className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Loyalty Program</h3>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Program
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{mockLoyaltyProgram.name}</CardTitle>
              <CardDescription>{mockLoyaltyProgram.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Tiers</h4>
                  <div className="grid gap-2">
                    {mockLoyaltyProgram.tiers.map((tier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{tier.name}</span>
                          <p className="text-sm text-muted-foreground">
                            {tier.minPoints}+ points
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{tier.discountPercentage}% discount</p>
                          <p className="text-xs text-muted-foreground">
                            {tier.benefits.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Available Rewards</h4>
                  <div className="grid gap-2">
                    {mockLoyaltyProgram.rewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{reward.name}</span>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{reward.pointsRequired} points</p>
                          {reward.type === "discount" && (
                            <p className="text-sm">${reward.value} off</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Communication Campaigns</h3>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
          
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Welcome New Customers</h4>
                    <p className="text-sm text-muted-foreground">Email campaign for new signups</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge>Email</Badge>
                      <Badge variant="outline">Draft</Badge>
                      <span className="text-sm text-muted-foreground">Created 2 days ago</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconMessage className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Loyalty Program Launch</h4>
                    <p className="text-sm text-muted-foreground">SMS campaign for loyalty program announcement</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge>SMS</Badge>
                      <Badge variant="outline">Scheduled</Badge>
                      <span className="text-sm text-muted-foreground">Scheduled for Jan 25, 2024</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconMessage className="h-4 w-4" />
                    </Button>
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
