"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  IconPlus,
  IconMail,
  IconPhone,
  IconSend,
  IconEdit,
  IconTrash,
  IconEye,
  IconCalendar,
  IconTrendingUp,
  IconClock,
  IconCheck,
  IconX,
  IconTarget,
  IconMessage,
} from "@tabler/icons-react"
import { CommunicationCampaign } from "@/lib/types/customer"
import { ProtectedRoute } from "@/components/protected-route"

// Mock data - replace with actual API calls
const mockCampaigns: CommunicationCampaign[] = [
  {
    id: "1",
    name: "Welcome New Customers",
    type: "email",
    subject: "Welcome to Joantees!",
    content: "Thank you for joining us! Here's a special 10% discount for your first order...",
    targetSegment: "new_customers",
    scheduledDate: undefined,
    sentDate: "2024-01-20T10:00:00Z",
    status: "sent",
    openRate: 78.5,
    clickRate: 23.4,
    deliveryRate: 98.2,
    createdAt: "2024-01-19T14:30:00Z"
  },
  {
    id: "2",
    name: "Loyalty Program Launch",
    type: "sms",
    content: "🎉 Our new loyalty program is here! Earn points on every purchase. Learn more: [link]",
    targetSegment: "active_customers",
    scheduledDate: "2024-01-25T09:00:00Z",
    sentDate: undefined,
    status: "scheduled",
    createdAt: "2024-01-22T16:45:00Z"
  },
  {
    id: "3",
    name: "Winter Sale Reminder",
    type: "email",
    subject: "Last Chance: 50% Off Winter Collection",
    content: "Don't miss out! Our winter sale ends tomorrow. Shop now and save big...",
    targetCustomers: ["1", "2", "3"],
    scheduledDate: undefined,
    sentDate: "2024-01-18T15:30:00Z",
    status: "sent",
    openRate: 65.2,
    clickRate: 18.7,
    deliveryRate: 96.8,
    createdAt: "2024-01-17T11:20:00Z"
  },
  {
    id: "4",
    name: "Inactive Customer Re-engagement",
    type: "email",
    subject: "We miss you! Come back with 20% off",
    content: "It's been a while since your last order. Here's a special discount to welcome you back...",
    targetSegment: "inactive_customers",
    scheduledDate: undefined,
    sentDate: undefined,
    status: "draft",
    createdAt: "2024-01-23T09:15:00Z"
  },
  {
    id: "5",
    name: "VIP Exclusive Preview",
    type: "email",
    subject: "VIP Access: New Collection Preview",
    content: "As a VIP member, you get exclusive early access to our new collection...",
    targetSegment: "vip_customers",
    scheduledDate: "2024-01-28T08:00:00Z",
    sentDate: undefined,
    status: "scheduled",
    createdAt: "2024-01-24T13:30:00Z"
  }
]

const mockCampaignStats = {
  totalCampaigns: mockCampaigns.length,
  sentCampaigns: mockCampaigns.filter(c => c.status === "sent").length,
  scheduledCampaigns: mockCampaigns.filter(c => c.status === "scheduled").length,
  draftCampaigns: mockCampaigns.filter(c => c.status === "draft").length,
  averageOpenRate: 72.3,
  averageClickRate: 21.1,
  averageDeliveryRate: 97.5
}

export default function CommunicationsPage() {
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "email" as "email" | "sms",
    subject: "",
    content: "",
    targetSegment: "",
    targetCustomers: [] as string[],
    scheduledDate: ""
  })

  const handleCreateCampaign = () => {
    console.log("Creating campaign:", newCampaign)
    setIsCreateCampaignOpen(false)
    setNewCampaign({
      name: "",
      type: "email",
      subject: "",
      content: "",
      targetSegment: "",
      targetCustomers: [],
      scheduledDate: ""
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <IconCheck className="h-4 w-4 text-green-600" />
      case "scheduled": return <IconClock className="h-4 w-4 text-blue-600" />
      case "draft": return <IconEdit className="h-4 w-4 text-gray-600" />
      case "failed": return <IconX className="h-4 w-4 text-red-600" />
      default: return <IconClock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-100 text-green-800"
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "draft": return "bg-gray-100 text-gray-800"
      case "failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "email" ? <IconMail className="h-4 w-4" /> : <IconPhone className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communication Campaigns</h2>
          <p className="text-muted-foreground">
            Create and manage email and SMS marketing campaigns
          </p>
        </div>
        <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new email or SMS marketing campaign
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Welcome New Customers"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select value={newCampaign.type} onValueChange={(value: "email" | "sms") => setNewCampaign({ ...newCampaign, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCampaign.type === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    placeholder="e.g., Welcome to Joantees!"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="campaign-content">Content</Label>
                <Textarea
                  id="campaign-content"
                  placeholder="Enter your message content..."
                  rows={4}
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-segment">Target Segment</Label>
                <Select value={newCampaign.targetSegment} onValueChange={(value) => setNewCampaign({ ...newCampaign, targetSegment: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_customers">All Customers</SelectItem>
                    <SelectItem value="new_customers">New Customers</SelectItem>
                    <SelectItem value="active_customers">Active Customers</SelectItem>
                    <SelectItem value="inactive_customers">Inactive Customers</SelectItem>
                    <SelectItem value="vip_customers">VIP Customers</SelectItem>
                    <SelectItem value="frequent_buyers">Frequent Buyers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Schedule Date (Optional)</Label>
                <Input
                  id="scheduled-date"
                  type="datetime-local"
                  value={newCampaign.scheduledDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduledDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Create Campaign
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
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <IconMessage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCampaignStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {mockCampaignStats.sentCampaigns} sent, {mockCampaignStats.scheduledCampaigns} scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCampaignStats.averageOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <IconTarget className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCampaignStats.averageClickRate}%</div>
            <p className="text-xs text-muted-foreground">
              +1.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Rate</CardTitle>
            <IconSend className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCampaignStats.averageDeliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {mockCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(campaign.type)}
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(campaign.status)}
                            <span>{campaign.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      {campaign.subject && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Subject: {campaign.subject}
                        </p>
                      )}
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <IconTarget className="h-4 w-4" />
                          <span>
                            {campaign.targetSegment ? 
                              campaign.targetSegment.replace('_', ' ').toUpperCase() : 
                              `${campaign.targetCustomers?.length || 0} customers`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IconCalendar className="h-4 w-4" />
                          <span>
                            {campaign.sentDate ? 
                              `Sent ${formatDate(campaign.sentDate)}` :
                              campaign.scheduledDate ?
                                `Scheduled ${formatDate(campaign.scheduledDate)}` :
                                `Created ${formatDate(campaign.createdAt)}`
                            }
                          </span>
                        </div>
                      </div>
                      
                      {campaign.status === "sent" && (
                        <div className="flex items-center space-x-4 mt-3 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">Open Rate:</span>
                            <span className="font-medium">{campaign.openRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">Click Rate:</span>
                            <span className="font-medium">{campaign.clickRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">Delivery Rate:</span>
                            <span className="font-medium">{campaign.deliveryRate}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      {campaign.status === "draft" && (
                        <Button size="sm">
                          <IconSend className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}
                      {campaign.status === "scheduled" && (
                        <Button variant="outline" size="sm">
                          <IconClock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="space-y-4">
            {mockCampaigns.filter(c => c.type === "email").map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <IconMail className="h-4 w-4" />
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Subject: {campaign.subject}
                      </p>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <IconTarget className="h-4 w-4" />
                          <span>
                            {campaign.targetSegment ? 
                              campaign.targetSegment.replace('_', ' ').toUpperCase() : 
                              `${campaign.targetCustomers?.length || 0} customers`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IconCalendar className="h-4 w-4" />
                          <span>
                            {campaign.sentDate ? 
                              `Sent ${formatDate(campaign.sentDate)}` :
                              campaign.scheduledDate ?
                                `Scheduled ${formatDate(campaign.scheduledDate)}` :
                                `Created ${formatDate(campaign.createdAt)}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <div className="space-y-4">
            {mockCampaigns.filter(c => c.type === "sms").map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <IconPhone className="h-4 w-4" />
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <IconTarget className="h-4 w-4" />
                          <span>
                            {campaign.targetSegment ? 
                              campaign.targetSegment.replace('_', ' ').toUpperCase() : 
                              `${campaign.targetCustomers?.length || 0} customers`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IconCalendar className="h-4 w-4" />
                          <span>
                            {campaign.sentDate ? 
                              `Sent ${formatDate(campaign.sentDate)}` :
                              campaign.scheduledDate ?
                                `Scheduled ${formatDate(campaign.scheduledDate)}` :
                                `Created ${formatDate(campaign.createdAt)}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="space-y-4">
            {mockCampaigns.filter(c => c.status === "scheduled").map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(campaign.type)}
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          <div className="flex items-center space-x-1">
                            <IconClock className="h-4 w-4" />
                            <span>Scheduled</span>
                          </div>
                        </Badge>
                      </div>
                      
                      {campaign.subject && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Subject: {campaign.subject}
                        </p>
                      )}
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <IconTarget className="h-4 w-4" />
                          <span>
                            {campaign.targetSegment ? 
                              campaign.targetSegment.replace('_', ' ').toUpperCase() : 
                              `${campaign.targetCustomers?.length || 0} customers`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IconCalendar className="h-4 w-4" />
                          <span>
                            Scheduled for {formatDateTime(campaign.scheduledDate!)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
