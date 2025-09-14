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
import {
  apiClient,
  DeliveryZone,
  GhanaRegion,
  GhanaCity,
  DeliveryZoneArea,
  GhanaRegionsResponse,
  GhanaCitiesResponse,
  DeliveryZonesResponse,
  DeliveryZoneAreasResponse,
  AddAreaResponse,
} from "@/lib/api";
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

  // Ghana locations data
  const [regions, setRegions] = useState<GhanaRegion[]>([]);
  const [cities, setCities] = useState<GhanaCity[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deliveryFee: "",
    estimatedDays: "",
    coverageAreas: "",
  });

  // Structured area management
  const [zoneAreas, setZoneAreas] = useState<DeliveryZoneArea[]>([]);
  const [newArea, setNewArea] = useState({
    regionId: "",
    cityId: "",
    areaName: "",
  });

  useEffect(() => {
    fetchZones();
    fetchGhanaRegions();
  }, []);

  const fetchGhanaRegions = async () => {
    try {
      const response = await apiClient.getGhanaRegions();
      const data = response.data as GhanaRegionsResponse;
      if (data && data.regions) {
        setRegions(data.regions);
      }
    } catch (error) {
      console.error("Error fetching Ghana regions:", error);
    }
  };

  const fetchGhanaCities = async (regionId: number) => {
    try {
      const response = await apiClient.getGhanaCities(regionId);
      const data = response.data as GhanaCitiesResponse;
      if (data && data.cities) {
        setCities(data.cities);
      }
    } catch (error) {
      console.error("Error fetching Ghana cities:", error);
    }
  };

  const handleRegionChange = (regionId: string) => {
    const regionIdNum = parseInt(regionId);
    setSelectedRegionId(regionIdNum);
    setNewArea({ ...newArea, regionId, cityId: "", areaName: "" });
    if (regionIdNum) {
      fetchGhanaCities(regionIdNum);
    } else {
      setCities([]);
    }
  };

  const addArea = async () => {
    if (newArea.regionId && newArea.cityId && newArea.areaName) {
      if (editingZone) {
        // Editing existing zone - add to backend
        try {
          const response = await apiClient.addAreaToDeliveryZone(
            editingZone.id,
            {
              regionId: parseInt(newArea.regionId),
              cityId: parseInt(newArea.cityId),
              areaName: newArea.areaName,
            }
          );

          const data = response.data as AddAreaResponse;
          if (data && data.area) {
            const region = regions.find(
              (r) => r.id === parseInt(newArea.regionId)
            );
            const city = cities.find((c) => c.id === parseInt(newArea.cityId));

            const newAreaData: DeliveryZoneArea = {
              id: data.area.id,
              delivery_zone_id: parseInt(editingZone.id),
              region_id: parseInt(newArea.regionId),
              city_id: parseInt(newArea.cityId),
              area_name: newArea.areaName,
              region_name: region?.name,
              city_name: city?.name,
            };

            setZoneAreas([...zoneAreas, newAreaData]);
            setNewArea({ regionId: "", cityId: "", areaName: "" });
            setSelectedRegionId(null);
            setCities([]);
            toast.success("Area added successfully");

            // Refresh the zones list to show updated coverageAreas
            fetchZones();
          }
        } catch (error) {
          console.error("Error adding area:", error);
          toast.error("Failed to add area");
        }
      } else {
        // Creating new zone - add to local state only
        const region = regions.find((r) => r.id === parseInt(newArea.regionId));
        const city = cities.find((c) => c.id === parseInt(newArea.cityId));

        const newAreaData: DeliveryZoneArea = {
          id: Date.now(), // Temporary ID for frontend
          delivery_zone_id: 0, // Will be set when zone is created
          region_id: parseInt(newArea.regionId),
          city_id: parseInt(newArea.cityId),
          area_name: newArea.areaName,
          region_name: region?.name,
          city_name: city?.name,
        };

        setZoneAreas([...zoneAreas, newAreaData]);
        setNewArea({ regionId: "", cityId: "", areaName: "" });
        setSelectedRegionId(null);
        setCities([]);
        toast.success("Area added to new zone");
      }
    }
  };

  const removeArea = async (areaId: number) => {
    if (editingZone) {
      try {
        await apiClient.removeAreaFromDeliveryZone(
          editingZone.id,
          areaId.toString()
        );
        setZoneAreas(zoneAreas.filter((area) => area.id !== areaId));
        toast.success("Area removed successfully");

        // Refresh the zones list to show updated coverageAreas
        fetchZones();
      } catch (error) {
        console.error("Error removing area:", error);
        toast.error("Failed to remove area");
      }
    }
  };

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      // Try the regular delivery zones endpoint first (public)
      const response = await apiClient.getDeliveryZones();

      const data = response.data as DeliveryZonesResponse;
      if (data && data.zones) {
        // Process zones to ensure coverageAreas is populated from structuredAreas
        const processedZones = data.zones.map((zone) => {
          if (zone.structuredAreas && zone.structuredAreas.length > 0) {
            // If structuredAreas exist but coverageAreas is empty, populate it
            if (!zone.coverageAreas || zone.coverageAreas.length === 0) {
              // Try different possible property names for area name
              zone.coverageAreas = zone.structuredAreas.map((area) => {
                const areaObj = area as unknown as Record<string, unknown>;
                return (
                  (areaObj.area_name as string) ||
                  (areaObj.areaName as string) ||
                  (areaObj.name as string) ||
                  (areaObj.area as string) ||
                  "Unknown Area"
                );
              });
            }
          }
          return zone;
        });
        setZones(processedZones);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where response is directly an array
        setZones(response.data as DeliveryZone[]);
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

      if (editingZone) {
        // Update existing zone
        const response = await apiClient.updateDeliveryZone(editingZone.id, {
          name: formData.name,
          description: formData.description,
          deliveryFee: parseFloat(formData.deliveryFee),
          estimatedDays: formData.estimatedDays,
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
          coverageAreas: [], // Will be managed through structured areas
        });

        // Handle different possible response structures
        let newZoneId;
        if (response.data && typeof response.data === "object") {
          // Try different possible ID fields
          const data = response.data as Record<string, unknown>;
          newZoneId =
            (data.id as string) ||
            ((data.zone as Record<string, unknown>)?.id as string);
        }

        if (newZoneId) {
          // Add all structured areas to the new zone
          if (zoneAreas.length > 0) {
            try {
              for (const area of zoneAreas) {
                await apiClient.addAreaToDeliveryZone(newZoneId, {
                  regionId: area.region_id,
                  cityId: area.city_id,
                  areaName: area.area_name,
                });
              }
              toast.success("Delivery zone and areas created successfully");
            } catch (error) {
              console.error("Error adding areas to new zone:", error);
              toast.error("Zone created but failed to add some areas");
            }
          } else {
            toast.success("Delivery zone created successfully");
          }

          // Add a small delay to ensure backend processes all areas
          setTimeout(() => {
            fetchZones();
          }, 1000);
          resetForm();
        } else {
          console.error("Could not find zone ID in response:", response);
          toast.error(
            "Zone created but could not add areas - please refresh and try again"
          );
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

  const handleEdit = async (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description,
      deliveryFee: zone.deliveryFee.toString(),
      estimatedDays: zone.estimatedDays,
      coverageAreas: zone.coverageAreas.join(", "),
    });

    // Load structured areas from backend
    try {
      console.log("Loading areas for zone:", zone.id);
      const response = await apiClient.getDeliveryZoneAreas(zone.id);
      console.log("Get zone areas response:", response);

      const data = response.data as DeliveryZoneAreasResponse;
      if (data && data.areas) {
        console.log("Loaded areas:", data.areas);
        console.log("First area structure:", data.areas[0]);
        console.log("First area properties:", Object.keys(data.areas[0]));
        setZoneAreas(data.areas);
      } else {
        console.log("No areas found in response");
        setZoneAreas([]);
      }
    } catch (error) {
      console.error("Error loading zone areas:", error);

      // Fallback: try to use structuredAreas from the zone if available
      if (zone.structuredAreas && zone.structuredAreas.length > 0) {
        console.log(
          "Using fallback structuredAreas from zone:",
          zone.structuredAreas
        );
        setZoneAreas(zone.structuredAreas);
      } else {
        setZoneAreas([]);
      }
    }

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
    setZoneAreas([]);
    setNewArea({ regionId: "", cityId: "", areaName: "" });
    setSelectedRegionId(null);
    setCities([]);
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

                          <div className="space-y-4">
                            <Label>Coverage Areas</Label>

                            {/* Add new area section */}
                            <div className="border rounded-lg p-4 space-y-4">
                              <h4 className="font-medium text-sm">
                                Add Coverage Area
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="region">Region</Label>
                                  <Select
                                    value={newArea.regionId}
                                    onValueChange={handleRegionChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {regions.map((region) => (
                                        <SelectItem
                                          key={region.id}
                                          value={region.id.toString()}
                                        >
                                          {region.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="city">City</Label>
                                  <Select
                                    value={newArea.cityId}
                                    onValueChange={(value) =>
                                      setNewArea({
                                        ...newArea,
                                        cityId: value,
                                        areaName: "",
                                      })
                                    }
                                    disabled={!selectedRegionId}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cities.map((city) => (
                                        <SelectItem
                                          key={city.id}
                                          value={city.id.toString()}
                                        >
                                          {city.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="areaName">Area Name</Label>
                                  <Input
                                    id="areaName"
                                    value={newArea.areaName}
                                    onChange={(e) =>
                                      setNewArea({
                                        ...newArea,
                                        areaName: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., East Legon"
                                    disabled={!newArea.cityId}
                                  />
                                </div>
                              </div>

                              <Button
                                type="button"
                                onClick={addArea}
                                disabled={
                                  !newArea.regionId ||
                                  !newArea.cityId ||
                                  !newArea.areaName
                                }
                                size="sm"
                              >
                                <IconPlus className="h-4 w-4 mr-2" />
                                Add Area
                              </Button>
                            </div>

                            {/* Display added areas */}
                            {zoneAreas.length > 0 && (
                              <div className="space-y-2">
                                <Label>Added Areas</Label>
                                <div className="space-y-2">
                                  {zoneAreas.map((area) => (
                                    <div
                                      key={area.id}
                                      className="flex items-center justify-between p-2 border rounded"
                                    >
                                      <span className="text-sm">
                                        {(() => {
                                          const areaObj =
                                            area as unknown as Record<
                                              string,
                                              unknown
                                            >;
                                          const regionName =
                                            (areaObj.region_name as string) ||
                                            (areaObj.regionName as string) ||
                                            "Unknown Region";
                                          const cityName =
                                            (areaObj.city_name as string) ||
                                            (areaObj.cityName as string) ||
                                            "Unknown City";
                                          const areaName =
                                            (areaObj.area_name as string) ||
                                            (areaObj.areaName as string) ||
                                            "Unknown Area";
                                          return `${regionName} → ${cityName} → ${areaName}`;
                                        })()}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeArea(area.id)}
                                      >
                                        <IconTrash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
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
