"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  IconStar,
  IconGift,
  IconTrendingUp,
  IconUsers,
  IconEdit,
  IconTrash,
  IconSettings,
  IconCalendar,
  IconCurrency,
  IconTruck,
  IconPercentage,
  IconCrown,
  IconAward,
} from "@tabler/icons-react"
import { LoyaltyProgram } from "@/lib/types/customer"
import { ProtectedRoute } from "@/components/protected-route"

// Mock data - replace with actual API calls
const mockLoyaltyPrograms: LoyaltyProgram[] = [
  {
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
        benefits: ["10% discount", "Free shipping on orders ₵50+"],
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
        name: "₵10 Off",
        description: "₵10 discount on your next order",
        pointsRequired: 200,
        type: "discount",
        value: 10,
        isActive: true
      },
      {
        id: "3",
        name: "₵25 Off",
        description: "₵25 discount on orders ₵100+",
        pointsRequired: 500,
        type: "discount",
        value: 25,
        isActive: true
      },
      {
        id: "4",
        name: "Free Gift",
        description: "Free branded t-shirt with any order",
        pointsRequired: 300,
        type: "gift",
        value: 0,
        isActive: false
      }
    ],
    isActive: true
  },
  {
    id: "2",
    name: "Holiday Special 2023",
    description: "Special holiday loyalty program with bonus points",
    type: "custom",
    startDate: "2023-11-01",
    endDate: "2023-12-31",
    tiers: [
      {
        name: "Holiday Shopper",
        minPoints: 0,
        benefits: ["Double points on all purchases"],
        discountPercentage: 0
      }
    ],
    rewards: [
      {
        id: "5",
        name: "Holiday Gift Box",
        description: "Curated gift box worth ₵50",
        pointsRequired: 1000,
        type: "gift",
        value: 50,
        isActive: false
      }
    ],
    isActive: false
  }
]

const mockLoyaltyStats = {
  totalPrograms: mockLoyaltyPrograms.length,
  activePrograms: mockLoyaltyPrograms.filter(p => p.isActive).length,
  totalMembers: 1250,
  totalPointsIssued: 45600,
  totalPointsRedeemed: 23400,
  averagePointsPerCustomer: 36.5
}

export default function LoyaltyProgramPage() {
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false)
  const [isCreateRewardOpen, setIsCreateRewardOpen] = useState(false)
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    type: "quarterly" as "quarterly" | "annual" | "custom",
    startDate: "",
    endDate: ""
  })
  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    pointsRequired: "",
    type: "discount" as "discount" | "free_shipping" | "gift" | "cashback",
    value: ""
  })

  const handleCreateProgram = () => {
    console.log("Creating program:", newProgram)
    setIsCreateProgramOpen(false)
    setNewProgram({
      name: "",
      description: "",
      type: "quarterly",
      startDate: "",
      endDate: ""
    })
  }

  const handleCreateReward = () => {
    console.log("Creating reward:", newReward)
    setIsCreateRewardOpen(false)
    setNewReward({
      name: "",
      description: "",
      pointsRequired: "",
      type: "discount",
      value: ""
    })
  }

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "bronze": return <IconAward className="h-5 w-5 text-amber-600" />
      case "silver": return <IconAward className="h-5 w-5 text-gray-600" />
      case "gold": return <IconCrown className="h-5 w-5 text-yellow-600" />
      case "platinum": return <IconCrown className="h-5 w-5 text-purple-600" />
      default: return <IconStar className="h-5 w-5" />
    }
  }

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "bronze": return "bg-amber-100 text-amber-800"
      case "silver": return "bg-gray-100 text-gray-800"
      case "gold": return "bg-yellow-100 text-yellow-800"
      case "platinum": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "discount": return <IconPercentage className="h-4 w-4" />
      case "free_shipping": return <IconTruck className="h-4 w-4" />
      case "gift": return <IconGift className="h-4 w-4" />
      case "cashback": return <IconCurrency className="h-4 w-4" />
      default: return <IconStar className="h-4 w-4" />
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
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Loyalty Programs</h2>
          <p className="text-muted-foreground">
            Manage customer loyalty programs and rewards
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateRewardOpen} onOpenChange={setIsCreateRewardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconGift className="mr-2 h-4 w-4" />
                Add Reward
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Reward</DialogTitle>
                <DialogDescription>
                  Add a new reward to your loyalty program
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reward-name">Reward Name</Label>
                  <Input
                    id="reward-name"
                    placeholder="e.g., ₵10 Off"
                    value={newReward.name}
                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward-description">Description</Label>
                  <Textarea
                    id="reward-description"
                    placeholder="Describe the reward..."
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="points-required">Points Required</Label>
                    <Input
                      id="points-required"
                      type="number"
                      placeholder="100"
                      value={newReward.pointsRequired}
                      onChange={(e) => setNewReward({ ...newReward, pointsRequired: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward-type">Reward Type</Label>
                    <Select value={newReward.type} onValueChange={(value: "free_shipping" | "discount" | "gift" | "cashback") => setNewReward({ ...newReward, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                        <SelectItem value="gift">Gift</SelectItem>
                        <SelectItem value="cashback">Cashback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {newReward.type === "discount" && (
                  <div className="space-y-2">
                    <Label htmlFor="reward-value">Discount Amount (₵)</Label>
                    <Input
                      id="reward-value"
                      type="number"
                      placeholder="10"
                      value={newReward.value}
                      onChange={(e) => setNewReward({ ...newReward, value: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateRewardOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReward}>
                    Create Reward
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateProgramOpen} onOpenChange={setIsCreateProgramOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Create Program
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Loyalty Program</DialogTitle>
                <DialogDescription>
                  Set up a new loyalty program for your customers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program-name">Program Name</Label>
                  <Input
                    id="program-name"
                    placeholder="e.g., Q1 2024 Loyalty Program"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-description">Description</Label>
                  <Textarea
                    id="program-description"
                    placeholder="Describe the program..."
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-type">Program Type</Label>
                  <Select value={newProgram.type} onValueChange={(value: "quarterly" | "annual" | "custom") => setNewProgram({ ...newProgram, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newProgram.startDate}
                      onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newProgram.endDate}
                      onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateProgramOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProgram}>
                    Create Program
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <IconStar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLoyaltyStats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              {mockLoyaltyStats.activePrograms} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLoyaltyStats.totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLoyaltyStats.totalPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <IconGift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLoyaltyStats.totalPointsRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((mockLoyaltyStats.totalPointsRedeemed / mockLoyaltyStats.totalPointsIssued) * 100).toFixed(1)}% redemption rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <div className="space-y-4">
            {mockLoyaltyPrograms.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{program.name}</CardTitle>
                      <CardDescription>{program.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={program.isActive ? "default" : "outline"}>
                        {program.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconSettings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium mb-2">Program Details</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <IconCalendar className="h-4 w-4" />
                          <span>{formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <IconStar className="h-4 w-4" />
                          <span>{program.type.charAt(0).toUpperCase() + program.type.slice(1)} Program</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Tiers</h4>
                      <div className="space-y-1">
                        {program.tiers.map((tier, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {getTierIcon(tier.name)}
                            <span className="text-sm">{tier.name}</span>
                            <Badge className={getTierColor(tier.name)} variant="outline">
                              {tier.minPoints}+ pts
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Rewards</h4>
                      <div className="space-y-1">
                        {program.rewards.slice(0, 3).map((reward) => (
                          <div key={reward.id} className="flex items-center space-x-2">
                            {getRewardIcon(reward.type)}
                            <span className="text-sm">{reward.name}</span>
                            <Badge variant={reward.isActive ? "default" : "outline"}>
                              {reward.pointsRequired} pts
                            </Badge>
                          </div>
                        ))}
                        {program.rewards.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{program.rewards.length - 3} more rewards
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mockLoyaltyPrograms[0].tiers.map((tier, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {getTierIcon(tier.name)}
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {tier.minPoints}+ points required
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {tier.discountPercentage}%
                      </div>
                      <p className="text-sm text-muted-foreground">Discount</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="text-sm text-muted-foreground">
                            • {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockLoyaltyPrograms[0].rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getRewardIcon(reward.type)}
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                    </div>
                    <Badge variant={reward.isActive ? "default" : "outline"}>
                      {reward.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Points Required</span>
                      <Badge variant="outline">{reward.pointsRequired}</Badge>
                    </div>
                    {reward.type === "discount" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Value</span>
                        <span className="text-sm">₵{reward.value}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Program Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Members</span>
                    <span className="font-medium">{mockLoyaltyStats.totalMembers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Points per Customer</span>
                    <span className="font-medium">{mockLoyaltyStats.averagePointsPerCustomer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Redemption Rate</span>
                    <span className="font-medium">
                      {((mockLoyaltyStats.totalPointsRedeemed / mockLoyaltyStats.totalPointsIssued) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLoyaltyPrograms[0].tiers.map((tier, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTierIcon(tier.name)}
                        <span className="text-sm">{tier.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.floor(Math.random() * 300) + 50}
                        </div>
                        <div className="text-xs text-muted-foreground">customers</div>
                      </div>
                    </div>
                  ))}
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
