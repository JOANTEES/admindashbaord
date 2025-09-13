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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  IconEdit,
  IconTrash,
  IconMapPin,
  IconTruck,
  IconClock,
  IconLoader,
  IconToggleRight,
  IconToggleLeft,
} from "@tabler/icons-react";
import { ProtectedRoute } from "@/components/protected-route";
import { apiClient, DeliveryZone } from "@/lib/api";
import { toast } from "sonner";

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deliveryFee: "",
    estimatedDays: "",
    coverageAreas: "",
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      // Try the regular delivery zones endpoint first (public)
      const response = await apiClient.getDeliveryZones();
      console.log("Delivery zones response:", response);

      if (response.data && response.data.zones) {
        setZones(response.data.zones);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where response is directly an array
        setZones(response.data);
      } else {
        console.log("No zones found in response, setting empty array");
        setZones([]);
      }
    } catch (error) {
      console.error("Error fetching delivery zones:", error);
      console.error("Full error:", error);
      toast.error(
        "Failed to load delivery zones - check if backend is running"
      );
      setZones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.deliveryFee ||
      !formData.estimatedDays
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const coverageAreas = formData.coverageAreas
        .split(",")
        .map((area) => area.trim())
        .filter((area) => area.length > 0);

      if (editingZone) {
        // Update existing zone
        const response = await apiClient.updateDeliveryZone(editingZone.id, {
          name: formData.name,
          description: formData.description,
          deliveryFee: parseFloat(formData.deliveryFee),
          estimatedDays: formData.estimatedDays,
          coverageAreas,
        });

        if (response.data) {
          toast.success("Delivery zone updated successfully");
          fetchZones();
          resetForm();
        }
      } else {
        // Create new zone
        const response = await apiClient.createDeliveryZone({
          name: formData.name,
          description: formData.description,
          deliveryFee: parseFloat(formData.deliveryFee),
          estimatedDays: formData.estimatedDays,
          coverageAreas,
        });

        if (response.data) {
          toast.success("Delivery zone created successfully");
          fetchZones();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving delivery zone:", error);
      toast.error("Failed to save delivery zone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description,
      deliveryFee: zone.deliveryFee.toString(),
      estimatedDays: zone.estimatedDays,
      coverageAreas: zone.coverageAreas.join(", "),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery zone?")) {
      return;
    }

    try {
      setIsDeleting(id);
      const response = await apiClient.deleteDeliveryZone(id);
      if (response.data) {
        toast.success("Delivery zone deleted successfully");
        fetchZones();
      }
    } catch (error) {
      console.error("Error deleting delivery zone:", error);
      toast.error("Failed to delete delivery zone");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsToggling(id);
      const response = await apiClient.updateDeliveryZone(id, {
        isActive: !currentStatus,
      });
      if (response.data) {
        toast.success(
          `Delivery zone ${
            !currentStatus ? "activated" : "deactivated"
          } successfully`
        );
        fetchZones();
      }
    } catch (error) {
      console.error("Error updating delivery zone status:", error);
      toast.error("Failed to update delivery zone status");
    } finally {
      setIsToggling(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      deliveryFee: "",
      estimatedDays: "",
      coverageAreas: "",
    });
    setEditingZone(null);
    setIsDialogOpen(false);
  };

  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.coverageAreas.some((area) =>
        area.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const activeZones = zones.filter((zone) => zone.isActive).length;
  const totalZones = zones.length;
  const averageFee =
    zones.length > 0
      ? zones.reduce((sum, zone) => sum + zone.deliveryFee, 0) / zones.length
      : 0;

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
                        <span>Loading delivery zones...</span>
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
                        Delivery Zones
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Manage delivery areas and fees
                      </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                          <IconPlus className="h-4 w-4 mr-2" />
                          Add Delivery Zone
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingZone
                              ? "Edit Delivery Zone"
                              : "Add New Delivery Zone"}
                          </DialogTitle>
                          <DialogDescription>
                            {editingZone
                              ? "Update the delivery zone details below."
                              : "Create a new delivery zone with coverage areas and fees."}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Zone Name *</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="e.g., East Legon"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="deliveryFee">
                                Delivery Fee (₵) *
                              </Label>
                              <Input
                                id="deliveryFee"
                                type="number"
                                step="0.01"
                                value={formData.deliveryFee}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    deliveryFee: e.target.value,
                                  })
                                }
                                placeholder="15.00"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Describe the coverage area..."
                              rows={3}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="estimatedDays">
                              Estimated Delivery Time *
                            </Label>
                            <Input
                              id="estimatedDays"
                              value={formData.estimatedDays}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  estimatedDays: e.target.value,
                                })
                              }
                              placeholder="e.g., 1-2 days"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="coverageAreas">
                              Coverage Areas
                            </Label>
                            <Input
                              id="coverageAreas"
                              value={formData.coverageAreas}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  coverageAreas: e.target.value,
                                })
                              }
                              placeholder="e.g., East Legon, Labone, Cantonments (comma-separated)"
                            />
                            <p className="text-xs text-muted-foreground">
                              Separate multiple areas with commas
                            </p>
                          </div>

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetForm}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                                  {editingZone ? "Updating..." : "Creating..."}
                                </>
                              ) : editingZone ? (
                                "Update Zone"
                              ) : (
                                "Create Zone"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Zones
                        </CardTitle>
                        <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalZones}</div>
                        <p className="text-xs text-muted-foreground">
                          delivery zones
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Active Zones
                        </CardTitle>
                        <IconTruck className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                          {activeZones}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          currently active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Average Fee
                        </CardTitle>
                        <IconClock className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                          ₵{averageFee.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          per delivery
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search */}
                  <div className="relative mb-6">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search delivery zones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Delivery Zones Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Zones</CardTitle>
                      <CardDescription>
                        Manage your delivery coverage areas and pricing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Zone Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Coverage Areas</TableHead>
                            <TableHead>Delivery Fee</TableHead>
                            <TableHead>Est. Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredZones.map((zone) => (
                            <TableRow key={zone.id}>
                              <TableCell>
                                <div className="font-medium">{zone.name}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground max-w-xs truncate">
                                  {zone.description}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {zone.coverageAreas
                                    .slice(0, 2)
                                    .map((area, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {area}
                                      </Badge>
                                    ))}
                                  {zone.coverageAreas.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{zone.coverageAreas.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  ₵{zone.deliveryFee.toFixed(2)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {zone.estimatedDays}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    zone.isActive
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                                  }
                                >
                                  {zone.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(zone)}
                                  >
                                    <IconEdit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleStatus(zone.id, zone.isActive)
                                    }
                                    disabled={isToggling === zone.id}
                                  >
                                    {isToggling === zone.id ? (
                                      <IconLoader className="h-4 w-4 animate-spin" />
                                    ) : zone.isActive ? (
                                      <IconToggleLeft className="h-4 w-4" />
                                    ) : (
                                      <IconToggleRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(zone.id)}
                                    disabled={isDeleting === zone.id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    {isDeleting === zone.id ? (
                                      <IconLoader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <IconTrash className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {filteredZones.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <IconMapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No delivery zones found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Create your first delivery zone to get started"}
                        </p>
                        {!searchTerm && (
                          <Button onClick={() => setIsDialogOpen(true)}>
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add Delivery Zone
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
