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
import { IconPlus, IconSearch, IconFilter, IconSortAscending, IconSortDescending, IconUser, IconEdit, IconTrash, IconShield } from "@tabler/icons-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "manager" | "staff" | "viewer"
  status: "active" | "inactive" | "suspended"
  department: string
  lastLogin: string
  createdAt: string
  permissions: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@joantees.com",
      phone: "+233 24 123 4567",
      role: "admin",
      status: "active",
      department: "Management",
      lastLogin: "2024-03-10T10:30:00Z",
      createdAt: "2024-01-01",
      permissions: ["all"]
    },
    {
      id: "2",
      name: "John Manager",
      email: "john@joantees.com",
      phone: "+233 20 987 6543",
      role: "manager",
      status: "active",
      department: "Operations",
      lastLogin: "2024-03-09T14:20:00Z",
      createdAt: "2024-01-15",
      permissions: ["bookings", "users", "reports"]
    },
    {
      id: "3",
      name: "Sarah Staff",
      email: "sarah@joantees.com",
      phone: "+233 26 555 1234",
      role: "staff",
      status: "active",
      department: "Customer Service",
      lastLogin: "2024-03-08T09:15:00Z",
      createdAt: "2024-02-01",
      permissions: ["bookings", "clothes"]
    },
    {
      id: "4",
      name: "Mike Viewer",
      email: "mike@joantees.com",
      phone: "+233 54 789 0123",
      role: "viewer",
      status: "inactive",
      department: "Marketing",
      lastLogin: "2024-03-05T16:45:00Z",
      createdAt: "2024-02-15",
      permissions: ["reports"]
    },
    {
      id: "5",
      name: "David Staff",
      email: "david@joantees.com",
      phone: "+233 27 456 7890",
      role: "staff",
      status: "suspended",
      department: "Operations",
      lastLogin: "2024-03-01T11:30:00Z",
      createdAt: "2024-03-01",
      permissions: ["bookings"]
    }
  ])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    password: "",
    confirmPassword: ""
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "role" | "status" | "lastLogin">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
      return matchesSearch && matchesRole && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "role":
          aValue = a.role
          bValue = b.role
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "lastLogin":
          aValue = new Date(a.lastLogin).getTime()
          bValue = new Date(b.lastLogin).getTime()
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [users, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder])

  const roles = ["admin", "manager", "staff", "viewer"]
  const statuses = ["active", "inactive", "suspended"]
  const departments = ["Management", "Operations", "Customer Service", "Marketing", "Finance", "IT", "Sales"]

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "admin":
        return ["all"]
      case "manager":
        return ["bookings", "users", "reports", "clothes"]
      case "staff":
        return ["bookings", "clothes"]
      case "viewer":
        return ["reports"]
      default:
        return []
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (editingUser) {
      // Update existing user
      const updatedUser: User = {
        ...editingUser,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as User["role"],
        department: formData.department,
        permissions: getRolePermissions(formData.role)
      }

      setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user))
      toast.success("User updated successfully!")
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as User["role"],
        status: "active",
        department: formData.department,
        lastLogin: "",
        createdAt: new Date().toISOString().split('T')[0],
        permissions: getRolePermissions(formData.role)
      }

      setUsers([...users, newUser])
      toast.success("User created successfully!")
    }

    setFormData({ name: "", email: "", phone: "", role: "", department: "", password: "", confirmPassword: "" })
    setEditingUser(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      password: "",
      confirmPassword: ""
    })
    setIsDialogOpen(true)
  }

  const handleStatusChange = (id: string, newStatus: User["status"]) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: newStatus }
        : user
    ))
    toast.success(`User status updated to ${newStatus}`)
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
    toast.success("User deleted successfully!")
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500">Admin</Badge>
      case "manager":
        return <Badge className="bg-blue-500">Manager</Badge>
      case "staff":
        return <Badge className="bg-green-500">Staff</Badge>
      case "viewer":
        return <Badge className="bg-gray-500">Viewer</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-500">Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === "active").length
  const adminUsers = users.filter(u => u.role === "admin").length
  const staffUsers = users.filter(u => u.role === "staff").length

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
                      <h1 className="text-3xl font-bold text-foreground">Users Manager</h1>
                      <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <IconPlus className="h-4 w-4" />
                          Add New User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
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
                              <Label htmlFor="role">Role *</Label>
                              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map(role => (
                                    <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map(dept => (
                                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {!editingUser && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                  id="password"
                                  type="password"
                                  value={formData.password}
                                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  value={formData.confirmPassword}
                                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingUser ? "Update User" : "Add User"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setIsDialogOpen(false)
                              setEditingUser(null)
                              setFormData({ name: "", email: "", phone: "", role: "", department: "", password: "", confirmPassword: "" })
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">registered users</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <IconUser className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">{activeUsers}</div>
                        <p className="text-xs text-muted-foreground">active accounts</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <IconShield className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-500">{adminUsers}</div>
                        <p className="text-xs text-muted-foreground">administrators</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Staff</CardTitle>
                        <IconUser className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{staffUsers}</div>
                        <p className="text-xs text-muted-foreground">staff members</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={(value: "name" | "role" | "status" | "lastLogin") => setSortBy(value)}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <IconSortAscending className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="role">Role</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="lastLogin">Last Login</SelectItem>
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

                  {/* Users Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                  {user.phone && (
                                    <div className="text-sm text-muted-foreground">{user.phone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">{user.department}</div>
                              </TableCell>
                              <TableCell>{getStatusBadge(user.status)}</TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">{formatDate(user.lastLogin)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                                    <IconEdit className="h-4 w-4" />
                                  </Button>
                                  {user.status !== "suspended" && (
                                    <Select value={user.status} onValueChange={(value: User["status"]) => handleStatusChange(user.id, value)}>
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
                                    onClick={() => handleDelete(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {filteredAndSortedUsers.length === 0 && (
                    <div className="text-center py-12">
                      <IconUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No users found</h3>
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