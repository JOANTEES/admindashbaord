"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconUser,
  IconEye,
  IconEdit,
  IconTrash,
  IconShield,
  IconLoader,
} from "@tabler/icons-react";
import { ProtectedRoute } from "@/components/protected-route";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "staff" | "viewer" | "customer";
  status: "active" | "inactive" | "suspended";
  department: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "customer",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "role" | "status" | "lastLogin"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    department?: string;
    last_login?: string;
    created_at?: string;
  } | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsers();
      type BackendUser = {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        role?: string;
        is_active?: boolean;
        department?: string;
        last_login?: string;
        created_at?: string;
      };
      const data = response.data as { users?: BackendUser[] };
      if (data && data.users) {
        // Transform backend data to match frontend interface
        const transformedUsers = data.users
          .filter((u) => (u.role || "customer") === "customer")
          .map((user) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone: user.phone || "",
            role: (user.role || "customer") as
              | "admin"
              | "manager"
              | "staff"
              | "viewer"
              | "customer",
            status: (user.is_active === false ? "inactive" : "active") as
              | "active"
              | "inactive"
              | "suspended",
            department: user.department || "General",
            lastLogin: user.last_login || "",
            createdAt: user.created_at || new Date().toISOString(),
            permissions: getRolePermissions(user.role || "customer"),
          }));
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === "all" || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "lastLogin":
          aValue = new Date(a.lastLogin).getTime();
          bValue = new Date(b.lastLogin).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder]);

  const [reportsTopCustomers, setReportsTopCustomers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate?: string;
    }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(`/reports/customer-insights`);
        const payload = (res.data as any).data ?? res.data;
        const list = (payload?.topCustomers as any[]) || [];
        setReportsTopCustomers(
          list.map((c) => ({
            id: String(c.id),
            name: c.name,
            email: c.email,
            totalOrders: c.totalOrders ?? 0,
            totalSpent: c.totalSpent ?? 0,
            lastOrderDate: c.lastOrderDate,
          }))
        );
      } catch (e) {
        // non-fatal: keep table hidden if endpoint not available
        setReportsTopCustomers([]);
      }
    })();
  }, []);

  const roles = ["customer"]; // Only customers visible here
  const statuses = ["active", "inactive", "suspended"];
  const departments: string[] = ["General"]; // Keep minimal for customers

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "admin":
        return ["all"];
      case "manager":
        return ["bookings", "users", "reports", "clothes"];
      case "staff":
        return ["bookings", "clothes"];
      case "viewer":
        return ["reports"];
      case "customer":
        return ["profile"];
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCreating = !editingUser;

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      (isCreating && !formData.password)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isCreating && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const response = await apiClient.updateUser(editingUser.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          department: formData.department,
        });

        if (response.data) {
          toast.success("User updated successfully!");
          fetchUsers(); // Refresh the list
        }
      } else {
        // Create new user using registration endpoint
        const response = await apiClient.registerUser({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
        });

        if (response.data) {
          toast.success("User created successfully!");
          fetchUsers(); // Refresh the list
        }
      }

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "customer",
        department: "",
        password: "",
        confirmPassword: "",
      });
      setEditingUser(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };

  const handleEdit = (user: User) => {
    const [firstName, ...lastNameParts] = user.name.split(" ");
    const lastName = lastNameParts.join(" ");

    setEditingUser(user);
    setFormData({
      firstName: firstName || "",
      lastName: lastName || "",
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      password: "",
      confirmPassword: "",
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: User["status"]) => {
    try {
      const response = await apiClient.updateUserStatus(id, newStatus);
      if (response.data) {
        toast.success(`User status updated to ${newStatus}`);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiClient.deleteUser(id);
      if (response.data) {
        toast.success("User deleted successfully!");
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleView = async (id: string) => {
    try {
      setIsViewLoading(true);
      setIsViewOpen(true);
      const res = await apiClient.getUserById(id);
      interface BackendUserDetails {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        phone?: string;
        department?: string;
        last_login?: string;
        created_at?: string;
      }
      const payload = res.data as { user?: BackendUserDetails };
      if (payload && payload.user) {
        setViewData(payload.user);
      } else {
        setViewData(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user details");
      setViewData(null);
    } finally {
      setIsViewLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500">Admin</Badge>;
      case "manager":
        return <Badge className="bg-blue-500">Manager</Badge>;
      case "staff":
        return <Badge className="bg-green-500">Staff</Badge>;
      case "viewer":
        return <Badge className="bg-gray-500">Viewer</Badge>;
      case "customer":
        return <Badge className="bg-purple-500">Customer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-500">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = 0;
  const staffUsers = 0;

  if (isLoading) {
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
                    <div className="flex items-center justify-center h-64">
                      <div className="flex items-center gap-2">
                        <IconLoader className="h-6 w-6 animate-spin" />
                        <span>Loading users...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    );
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
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        Customers Manager
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Manage customer accounts
                      </p>
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
                          <DialogTitle>
                            {editingUser ? "Edit User" : "Add New User"}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name *</Label>
                              <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    firstName: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name *</Label>
                              <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    lastName: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    email: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="role">Role *</Label>
                              <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, role: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role.charAt(0).toUpperCase() +
                                        role.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Department removed for customers-only view */}
                          </div>

                          {!editingUser && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                  id="password"
                                  type="password"
                                  value={formData.password}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      password: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                  Confirm Password *
                                </Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  value={formData.confirmPassword}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      confirmPassword: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingUser ? "Update User" : "Add User"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsDialogOpen(false);
                                setEditingUser(null);
                                setFormData({
                                  firstName: "",
                                  lastName: "",
                                  email: "",
                                  phone: "",
                                  role: "customer",
                                  department: "",
                                  password: "",
                                  confirmPassword: "",
                                });
                              }}
                            >
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
                        <CardTitle className="text-sm font-medium">
                          Total Customers
                        </CardTitle>
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                          registered users
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Active Customers
                        </CardTitle>
                        <IconUser className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                          {activeUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          active accounts
                        </p>
                      </CardContent>
                    </Card>
                    {reportsTopCustomers.length > 0 && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Top Customer
                          </CardTitle>
                          <IconUser className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-base font-semibold mb-1 truncate">
                            {reportsTopCustomers[0].name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reportsTopCustomers[0].totalOrders} orders · GH₵
                            {reportsTopCustomers[0].totalSpent.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {/* Admin/Staff cards removed for customers-only view */}
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
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select
                        value={sortBy}
                        onValueChange={(
                          value: "name" | "role" | "status" | "lastLogin"
                        ) => setSortBy(value)}
                      >
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
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                      >
                        {sortOrder === "asc" ? (
                          <IconSortAscending className="h-4 w-4" />
                        ) : (
                          <IconSortDescending className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>All Customers</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            {/* Department column removed */}
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
                                  <div className="text-sm text-muted-foreground">
                                    {user.email}
                                  </div>
                                  {user.phone && (
                                    <div className="text-sm text-muted-foreground">
                                      {user.phone}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              {/* Department cell removed */}
                              <TableCell>
                                {getStatusBadge(user.status)}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(user.lastLogin)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleView(user.id)}
                                  >
                                    <IconEye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(user)}
                                  >
                                    <IconEdit className="h-4 w-4" />
                                  </Button>
                                  {user.status !== "suspended" && (
                                    <Select
                                      value={user.status}
                                      onValueChange={(value: User["status"]) =>
                                        handleStatusChange(user.id, value)
                                      }
                                    >
                                      <SelectTrigger className="w-[100px] h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {statuses.map((status) => (
                                          <SelectItem
                                            key={status}
                                            value={status}
                                          >
                                            {status.charAt(0).toUpperCase() +
                                              status.slice(1)}
                                          </SelectItem>
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

                  {/* Top Customers by Purchases (from reports endpoint) */}
                  {reportsTopCustomers.length > 0 && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-2">
                          Most purchases in selected period
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Orders</TableHead>
                              <TableHead>Total Spent</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportsTopCustomers.map((c) => (
                              <TableRow key={c.id}>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.email}</TableCell>
                                <TableCell>{c.totalOrders}</TableCell>
                                <TableCell>
                                  GH₵{c.totalSpent.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {filteredAndSortedUsers.length === 0 && (
                    <div className="text-center py-12">
                      <IconUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        No users found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}

                  {/* View User Dialog */}
                  <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>View User</DialogTitle>
                      </DialogHeader>
                      {isViewLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <IconLoader className="h-6 w-6 animate-spin" />
                        </div>
                      ) : viewData ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>First Name</Label>
                              <div className="mt-1 text-sm">
                                {viewData.first_name}
                              </div>
                            </div>
                            <div>
                              <Label>Last Name</Label>
                              <div className="mt-1 text-sm">
                                {viewData.last_name}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Email</Label>
                              <div className="mt-1 text-sm break-all">
                                {viewData.email}
                              </div>
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <div className="mt-1 text-sm">
                                {viewData.phone || "-"}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Role</Label>
                              <div className="mt-1 text-sm">
                                {viewData.role}
                              </div>
                            </div>
                            {/* Department removed from view dialog */}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Last Login</Label>
                              <div className="mt-1 text-sm">
                                {formatDate(viewData.last_login || "")}
                              </div>
                            </div>
                            <div>
                              <Label>Created At</Label>
                              <div className="mt-1 text-sm">
                                {formatDate(viewData.created_at || "")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No data
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
