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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  IconUsers, 
  IconShoppingCart, 
  IconUserPlus, 
  IconCalendar, 
  IconShirt,
  IconPlus,
  IconTrash,
  IconEdit,
  IconShield,
  IconMail,
  IconPhone
} from "@tabler/icons-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface Admin {
  id: string
  name: string
  email: string
  phone: string
  role: "super_admin" | "admin" | "moderator"
  status: "active" | "inactive"
  createdAt: string
}

export default function Page() {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+233 20 123 4567",
      role: "super_admin",
      status: "active",
      createdAt: "2024-01-01"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+233 24 987 6543",
      role: "admin",
      status: "active",
      createdAt: "2024-01-15"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+233 26 555 1234",
      role: "moderator",
      status: "inactive",
      createdAt: "2024-02-01"
    }
  ])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin" as Admin["role"]
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const stats = [
    {
      title: "Total Site Visitors",
      value: "2,153",
      icon: IconUsers,
      description: "Total visitors this month",
    },
    {
      title: "Purchases",
      value: "123",
      icon: IconShoppingCart,
      description: "Total purchases made",
    },
    {
      title: "User Signups",
      value: "456",
      icon: IconUserPlus,
      description: "New user registrations",
    },
    {
      title: "Bookings",
      value: "78",
      icon: IconCalendar,
      description: "Active bookings",
    },
    {
      title: "Clothes Uploaded",
      value: "34",
      icon: IconShirt,
      description: "Items in inventory",
    },
    {
      title: "Active Admins",
      value: admins.filter(admin => admin.status === "active").length.toString(),
      icon: IconShield,
      description: "Administrators",
    },
  ]

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields")
      return
    }

    const newAdmin: Admin = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: "active",
      createdAt: new Date().toISOString().split('T')[0]
    }

    setAdmins([...admins, newAdmin])
    setFormData({ name: "", email: "", phone: "", role: "admin" })
    setIsDialogOpen(false)
    toast.success("Admin added successfully!")
  }

  const handleDeleteAdmin = (id: string) => {
    const admin = admins.find(a => a.id === id)
    if (admin?.role === "super_admin") {
      toast.error("Cannot delete super admin")
      return
    }
    
    setAdmins(admins.filter(admin => admin.id !== id))
    toast.success("Admin removed successfully!")
  }

  const handleToggleStatus = (id: string) => {
    const admin = admins.find(a => a.id === id)
    if (admin?.role === "super_admin") {
      toast.error("Cannot deactivate super admin")
      return
    }

    setAdmins(admins.map(admin => 
      admin.id === id 
        ? { ...admin, status: admin.status === "active" ? "inactive" : "active" }
        : admin
    ))
    toast.success(`Admin ${admin?.status === "active" ? "deactivated" : "activated"} successfully!`)
  }

  const getRoleBadge = (role: Admin["role"]) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-red-500">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>
      case "moderator":
        return <Badge className="bg-green-500">Moderator</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: Admin["status"]) => {
    return status === "active" 
      ? <Badge className="bg-green-500">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>
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
                  <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard Overview</h1>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {stats.map((stat, index) => (
                      <Card key={index} className="border-2 hover:border-primary transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </CardTitle>
                          <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stat.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Welcome Card */}
                  <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-8">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <IconUsers className="h-6 w-6 text-background" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Welcome to Admin Dashboard
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Manage your clothes, bookings, and site content from one place.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Management Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <IconShield className="h-5 w-5" />
                          Admin Management
                        </CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                              <IconPlus className="h-4 w-4" />
                              Add Admin
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Add New Admin</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddAdmin} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                  id="phone"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                  placeholder="+233 XX XXX XXXX"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select value={formData.role} onValueChange={(value: Admin["role"]) => setFormData({...formData, role: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex gap-2 pt-4">
                                <Button type="submit" className="flex-1">Add Admin</Button>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {admins.map((admin) => (
                          <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <IconShield className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{admin.name}</h4>
                                  {getRoleBadge(admin.role)}
                                  {getStatusBadge(admin.status)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <IconMail className="h-3 w-3" />
                                    {admin.email}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <IconPhone className="h-3 w-3" />
                                    {admin.phone}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(admin.id)}
                                disabled={admin.role === "super_admin"}
                              >
                                <IconEdit className="h-4 w-4 mr-1" />
                                {admin.status === "active" ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAdmin(admin.id)}
                                disabled={admin.role === "super_admin"}
                                className="text-red-600 hover:text-red-700"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {admins.length === 0 && (
                          <div className="text-center py-8">
                            <IconShield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No admins found</h3>
                            <p className="text-muted-foreground">Add your first admin to get started</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
} 