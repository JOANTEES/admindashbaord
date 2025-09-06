"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconShoppingCart,
  IconCalendar,
  IconPackage,
  IconUserCheck,
  IconPlus,
  IconTrash,
  IconToggleRight,
  IconToggleLeft,
  IconLoader,
} from "@tabler/icons-react";
import { apiClient, Admin, DashboardStats } from "@/lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    totalPurchases: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalClothes: 0,
    activeAdmins: 0,
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin" as "admin" | "moderator",
    password: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard stats
      const statsResponse = await apiClient.getDashboardStats();
      if (statsResponse.data && statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
      }

      // Fetch admins
      const adminsResponse = await apiClient.getAdmins();
      if (adminsResponse.data && adminsResponse.data.admins) {
        setAdmins(adminsResponse.data.admins);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      setIsAddingAdmin(true);
      const response = await apiClient.addAdmin(formData);
      if (response.data) {
        toast.success("Admin added successfully");
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "admin",
          password: "",
        });
        fetchDashboardData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      setIsDeletingAdmin(id);
      const response = await apiClient.deleteAdmin(id);
      if (response.data) {
        toast.success("Admin deleted successfully");
        fetchDashboardData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin");
    } finally {
      setIsDeletingAdmin(null);
    }
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    try {
      setIsUpdatingStatus(id);
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await apiClient.updateAdminStatus(id, newStatus);
      if (response.data) {
        toast.success(`Admin status updated to ${newStatus}`);
        fetchDashboardData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update admin status");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="destructive">Super Admin</Badge>;
      case "admin":
        return <Badge variant="default">Admin</Badge>;
      case "moderator":
        return <Badge variant="secondary">Moderator</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-green-500">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const statsData = [
    {
      title: "Total Visitors",
      value: stats.totalVisitors.toLocaleString(),
      icon: IconUsers,
      description: "Total website visitors",
      trend: "+12% from last month",
    },
    {
      title: "Total Purchases",
      value: stats.totalPurchases.toLocaleString(),
      icon: IconShoppingCart,
      description: "Total orders placed",
      trend: "+8% from last month",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: IconUserCheck,
      description: "Registered users",
      trend: "+15% from last month",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: IconCalendar,
      description: "Event bookings",
      trend: "+5% from last month",
    },
    {
      title: "Total Clothes",
      value: stats.totalClothes.toLocaleString(),
      icon: IconPackage,
      description: "Products in inventory",
      trend: "+3% from last month",
    },
    {
      title: "Active Admins",
      value: stats.activeAdmins.toLocaleString(),
      icon: IconUsers,
      description: "Active administrators",
      trend: "No change",
    },
  ];

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
                        <span>Loading dashboard...</span>
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
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        Dashboard
                      </h1>
                      <p className="text-muted-foreground">
                        Welcome to your admin dashboard
                      </p>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statsData.map((stat, index) => (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {stat.title}
                          </CardTitle>
                          <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <p className="text-xs text-muted-foreground">
                            {stat.description}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {stat.trend}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Admin Management Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Admin Management</CardTitle>
                          <CardDescription>
                            Manage your admin users and their permissions
                          </CardDescription>
                        </div>
                        <Dialog
                          open={isAddDialogOpen}
                          onOpenChange={setIsAddDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button>
                              <IconPlus className="h-4 w-4 mr-2" />
                              Add Admin
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Admin</DialogTitle>
                              <DialogDescription>
                                Create a new admin account with specific
                                permissions.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Enter full name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
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
                                  placeholder="Enter email address"
                                />
                              </div>
                              <div>
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
                                  placeholder="Enter phone number"
                                />
                              </div>
                              <div>
                                <Label htmlFor="role">Role</Label>
                                <Select
                                  value={formData.role}
                                  onValueChange={(
                                    value: "admin" | "moderator"
                                  ) =>
                                    setFormData({ ...formData, role: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="moderator">
                                      Moderator
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="password">Password</Label>
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
                                  placeholder="Enter password"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddAdmin}
                                disabled={isAddingAdmin}
                              >
                                {isAddingAdmin ? (
                                  <>
                                    <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  "Add Admin"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {admins.length === 0 ? (
                        <div className="text-center py-8">
                          <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No admins found
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Add your first admin to get started
                          </p>
                          <Button onClick={() => setIsAddDialogOpen(true)}>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add Admin
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {admins.map((admin) => (
                            <div
                              key={admin.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                  <IconUsers className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{admin.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {admin.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {admin.phone}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getRoleBadge(admin.role)}
                                {getStatusBadge(admin.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleStatus(admin.id, admin.status)
                                  }
                                  disabled={isUpdatingStatus === admin.id}
                                >
                                  {isUpdatingStatus === admin.id ? (
                                    <IconLoader className="h-4 w-4 animate-spin" />
                                  ) : admin.status === "active" ? (
                                    <IconToggleRight className="h-4 w-4" />
                                  ) : (
                                    <IconToggleLeft className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  disabled={isDeletingAdmin === admin.id}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  {isDeletingAdmin === admin.id ? (
                                    <IconLoader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <IconTrash className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
