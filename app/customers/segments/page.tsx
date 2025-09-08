"use client"

import { useState } from "react"
import { SegmentCriteria } from "@/lib/api/customer"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconUsers,
  IconEdit,
  IconMessage,
  IconEye,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconCurrency,
  IconShoppingBag,
} from "@tabler/icons-react"
import { CustomerSegment } from "@/lib/types/customer"
import { ProtectedRoute } from "@/components/protected-route"

// Mock data - replace with actual API calls
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
  },
  {
    id: "4",
    name: "VIP Customers",
    description: "Platinum tier with high spending",
    criteria: { 
      loyaltyTier: ["platinum"],
      totalSpent: { min: 1000 }
    },
    customerCount: 12,
    createdAt: "2024-01-01"
  },
  {
    id: "5",
    name: "New Customers",
    description: "Registered in last 30 days",
    criteria: { lastPurchaseDays: 0, tags: ["new_customer_30d"] },
    customerCount: 89,
    createdAt: "2024-01-01"
  },
  {
    id: "6",
    name: "Athletic Enthusiasts",
    description: "Customers tagged as athletic",
    criteria: { tags: ["athletic", "fitness"] },
    customerCount: 34,
    createdAt: "2024-01-01"
  }
]

const mockSegmentStats = {
  totalSegments: mockSegments.length,
  totalCustomers: mockSegments.reduce((sum, segment) => sum + segment.customerCount, 0),
  averageSegmentSize: Math.round(mockSegments.reduce((sum, segment) => sum + segment.customerCount, 0) / mockSegments.length),
  growthRate: 12.5
}

export default function CustomerSegmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    criteria: {
      totalSpent: { min: "", max: "" },
      totalOrders: { min: "", max: "" },
      lastPurchaseDays: "",
      loyaltyTier: [] as string[],
      tags: [] as string[]
    }
  })

  const filteredSegments = mockSegments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateSegment = () => {
    // Here you would typically make an API call to create the segment
    console.log("Creating segment:", newSegment)
    setIsCreateDialogOpen(false)
    setNewSegment({
      name: "",
      description: "",
      criteria: {
        totalSpent: { min: "", max: "" },
        totalOrders: { min: "", max: "" },
        lastPurchaseDays: "",
        loyaltyTier: [],
        tags: []
      }
    })
  }

  const getSegmentIcon = (segmentName: string) => {
    if (segmentName.toLowerCase().includes("frequent") || segmentName.toLowerCase().includes("buyer")) {
      return <IconShoppingBag className="h-5 w-5" />
    }
    if (segmentName.toLowerCase().includes("value") || segmentName.toLowerCase().includes("vip")) {
      return <IconCurrency className="h-5 w-5" />
    }
    if (segmentName.toLowerCase().includes("inactive")) {
      return <IconTrendingDown className="h-5 w-5" />
    }
    if (segmentName.toLowerCase().includes("new")) {
      return <IconCalendar className="h-5 w-5" />
    }
    return <IconUsers className="h-5 w-5" />
  }

  const formatCriteria = (criteria: SegmentCriteria) => {
    const parts = []
    if (criteria.totalOrders?.min) parts.push(`${criteria.totalOrders.min}+ orders`)
    if (criteria.totalSpent?.min) parts.push(`₵${criteria.totalSpent.min}+ spent`)
    if (criteria.lastPurchaseDays) parts.push(`No purchase in ${criteria.lastPurchaseDays} days`)
    if (criteria.loyaltyTier?.length) parts.push(`${criteria.loyaltyTier.join(", ")} tier`)
    if (criteria.tags?.length) parts.push(`Tags: ${criteria.tags.join(", ")}`)
    return parts.join(" • ")
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Segments</h2>
          <p className="text-muted-foreground">
            Create and manage customer segments for targeted marketing
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Customer Segment</DialogTitle>
              <DialogDescription>
                Define criteria to automatically group customers into segments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Segment Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., High Value Customers"
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this segment"
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Segment Criteria</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Spent (Min)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newSegment.criteria.totalSpent.min}
                      onChange={(e) => setNewSegment({
                        ...newSegment,
                        criteria: {
                          ...newSegment.criteria,
                          totalSpent: { ...newSegment.criteria.totalSpent, min: e.target.value }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Spent (Max)</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={newSegment.criteria.totalSpent.max}
                      onChange={(e) => setNewSegment({
                        ...newSegment,
                        criteria: {
                          ...newSegment.criteria,
                          totalSpent: { ...newSegment.criteria.totalSpent, max: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Orders (Min)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newSegment.criteria.totalOrders.min}
                      onChange={(e) => setNewSegment({
                        ...newSegment,
                        criteria: {
                          ...newSegment.criteria,
                          totalOrders: { ...newSegment.criteria.totalOrders, min: e.target.value }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Orders (Max)</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={newSegment.criteria.totalOrders.max}
                      onChange={(e) => setNewSegment({
                        ...newSegment,
                        criteria: {
                          ...newSegment.criteria,
                          totalOrders: { ...newSegment.criteria.totalOrders, max: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Days Since Last Purchase</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 90 for inactive customers"
                    value={newSegment.criteria.lastPurchaseDays}
                    onChange={(e) => setNewSegment({
                      ...newSegment,
                      criteria: { ...newSegment.criteria, lastPurchaseDays: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loyalty Tier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loyalty tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSegment}>
                  Create Segment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSegmentStats.totalSegments}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSegmentStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Across all segments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Segment Size</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSegmentStats.averageSegmentSize}</div>
            <p className="text-xs text-muted-foreground">
              customers per segment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockSegmentStats.growthRate}%</div>
            <p className="text-xs text-muted-foreground">
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search segments..."
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

      {/* Segments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSegments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSegmentIcon(segment.name)}
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <IconEye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <IconMessage className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{segment.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customers</span>
                  <Badge variant="outline">{segment.customerCount}</Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Criteria:</span>
                  <p className="text-sm">{formatCriteria(segment.criteria)}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created: {new Date(segment.createdAt).toLocaleDateString()}</span>
                  <span>Auto-updated</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconUsers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No segments found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Create your first customer segment to get started"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <IconPlus className="mr-2 h-4 w-4" />
                Create Segment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
