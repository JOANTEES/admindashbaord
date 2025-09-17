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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IconPhone,
  IconMail,
  IconLoader,
  IconExternalLink,
} from "@tabler/icons-react";
import { ProtectedRoute } from "@/components/protected-route";
import {
  apiClient,
  PickupLocation,
  GhanaRegion,
  GhanaCity,
  GhanaRegionsResponse,
  GhanaCitiesResponse,
  PickupLocationsResponse,
} from "@/lib/api";
import { toast } from "sonner";

export default function PickupLocationsPage() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Ghana locations data
  const [regions, setRegions] = useState<GhanaRegion[]>([]);
  const [cities, setCities] = useState<GhanaCity[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    regionId: "",
    cityId: "",
    areaName: "",
    landmark: "",
    additionalInstructions: "",
    contactPhone: "",
    contactEmail: "",
    operatingHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed",
    },
  });

  useEffect(() => {
    fetchLocations();
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
    setFormData({ ...formData, regionId, cityId: "", areaName: "" });
    if (regionIdNum) {
      fetchGhanaCities(regionIdNum);
    } else {
      setCities([]);
    }
  };

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getPickupLocations();
      const data = response.data as PickupLocationsResponse;
      if (data && data.locations) {
        setLocations(data.locations);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Error fetching pickup locations:", error);
      toast.error("Failed to load pickup locations");
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.regionId ||
      !formData.cityId ||
      !formData.areaName ||
      !formData.contactPhone ||
      !formData.contactEmail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingLocation) {
        // Update existing location
        const response = await apiClient.updatePickupLocation(
          editingLocation.id,
          {
            name: formData.name,
            description: formData.description,
            regionId: parseInt(formData.regionId),
            cityId: parseInt(formData.cityId),
            areaName: formData.areaName,
            landmark: formData.landmark,
            additionalInstructions: formData.additionalInstructions,
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
            operatingHours: formData.operatingHours,
          }
        );

        if (response.data) {
          toast.success("Pickup location updated successfully");
          fetchLocations();
          resetForm();
        }
      } else {
        // Create new location
        const response = await apiClient.createPickupLocation({
          name: formData.name,
          description: formData.description,
          regionId: parseInt(formData.regionId),
          cityId: parseInt(formData.cityId),
          areaName: formData.areaName,
          landmark: formData.landmark,
          additionalInstructions: formData.additionalInstructions,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          operatingHours: formData.operatingHours,
        });

        if (response.data) {
          toast.success("Pickup location created successfully");
          fetchLocations();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving pickup location:", error);
      toast.error("Failed to save pickup location");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (location: PickupLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description,
      regionId: "",
      cityId: "",
      areaName: location.areaName,
      landmark: location.landmark || "",
      additionalInstructions: location.additionalInstructions || "",
      contactPhone: location.contactPhone,
      contactEmail: location.contactEmail,
      operatingHours: location.operatingHours as {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
      },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pickup location?")) {
      return;
    }

    try {
      setIsDeleting(id);
      await apiClient.deletePickupLocation(id);
      toast.success("Pickup location deleted successfully");
      fetchLocations();
    } catch (error) {
      console.error("Error deleting pickup location:", error);
      toast.error("Failed to delete pickup location");
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      regionId: "",
      cityId: "",
      areaName: "",
      landmark: "",
      additionalInstructions: "",
      contactPhone: "",
      contactEmail: "",
      operatingHours: {
        monday: "9:00 AM - 6:00 PM",
        tuesday: "9:00 AM - 6:00 PM",
        wednesday: "9:00 AM - 6:00 PM",
        thursday: "9:00 AM - 6:00 PM",
        friday: "9:00 AM - 6:00 PM",
        saturday: "10:00 AM - 4:00 PM",
        sunday: "Closed",
      },
    });
    setEditingLocation(null);
    setSelectedRegionId(null);
    setCities([]);
    setIsDialogOpen(false);
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.cityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLocations = locations.length;
  const locationsWithMaps = locations.filter(
    (loc) => loc.googleMapsLink
  ).length;

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Pickup Locations
                </h2>
                <p className="text-muted-foreground">
                  Manage your pickup locations and operating hours
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLocation
                        ? "Edit Pickup Location"
                        : "Add Pickup Location"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingLocation
                        ? "Update the pickup location details below."
                        : "Add a new pickup location for customers to collect their orders."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Location Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="e.g., Main Store - Accra"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone *</Label>
                        <Input
                          id="contactPhone"
                          value={formData.contactPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPhone: e.target.value,
                            })
                          }
                          placeholder="+233123456789"
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
                        placeholder="Describe this pickup location..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region *</Label>
                        <Select
                          value={formData.regionId}
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
                        <Label htmlFor="city">City *</Label>
                        <Select
                          value={formData.cityId}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
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
                        <Label htmlFor="areaName">Area Name *</Label>
                        <Input
                          id="areaName"
                          value={formData.areaName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              areaName: e.target.value,
                            })
                          }
                          placeholder="e.g., Osu"
                          disabled={!formData.cityId}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          value={formData.landmark}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              landmark: e.target.value,
                            })
                          }
                          placeholder="e.g., Near Osu Castle"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactEmail: e.target.value,
                            })
                          }
                          placeholder="accra@joantee.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalInstructions">
                        Additional Instructions
                      </Label>
                      <Textarea
                        id="additionalInstructions"
                        value={formData.additionalInstructions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalInstructions: e.target.value,
                          })
                        }
                        placeholder="Special instructions for customers..."
                        rows={2}
                      />
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
                          <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <IconPlus className="h-4 w-4 mr-2" />
                        )}
                        {editingLocation
                          ? "Update Location"
                          : "Create Location"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Locations
                  </CardTitle>
                  <IconMapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLocations}</div>
                  <p className="text-xs text-muted-foreground">
                    Pickup locations available
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    With Maps
                  </CardTitle>
                  <IconExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{locationsWithMaps}</div>
                  <p className="text-xs text-muted-foreground">
                    Locations with Google Maps links
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Coverage
                  </CardTitle>
                  <IconMapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(locations.map((loc) => loc.cityName)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cities covered
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup Locations</CardTitle>
                <CardDescription>
                  Manage all your pickup locations and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <IconLoader className="h-6 w-6 animate-spin mr-2" />
                    Loading pickup locations...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Operating Hours</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLocations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-sm text-muted-foreground max-w-xs truncate">
                                {location.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {location.areaName}, {location.cityName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {location.regionName}
                              </div>
                              {location.landmark && (
                                <div className="text-xs text-muted-foreground">
                                  Near {location.landmark}
                                </div>
                              )}
                              {location.googleMapsLink && (
                                <a
                                  href={location.googleMapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center"
                                >
                                  <IconExternalLink className="h-3 w-3 mr-1" />
                                  View on Maps
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm flex items-center">
                                <IconPhone className="h-3 w-3 mr-1" />
                                {location.contactPhone}
                              </div>
                              <div className="text-sm flex items-center">
                                <IconMail className="h-3 w-3 mr-1" />
                                {location.contactEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">
                                <span className="font-medium">Mon-Fri:</span>{" "}
                                {location.operatingHours.monday}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">Sat:</span>{" "}
                                {location.operatingHours.saturday}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">Sun:</span>{" "}
                                {location.operatingHours.sunday}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(location)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(location.id)}
                                disabled={isDeleting === location.id}
                              >
                                {isDeleting === location.id ? (
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
                )}

                {filteredLocations.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pickup locations found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
