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
import { Badge } from "@/components/ui/badge";
import {
  IconSettings,
  IconCurrency,
  IconTruck,
  IconLoader,
  IconDeviceFloppy,
  IconRefresh,
} from "@tabler/icons-react";
import { ProtectedRoute } from "@/components/protected-route";
import { apiClient, AppSettings } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    id: 1,
    taxRate: 10.0,
    freeShippingThreshold: 100.0,
    largeOrderQuantityThreshold: 10,
    largeOrderDeliveryFee: 50.0,
    currencySymbol: "₵",
    currencyCode: "GHS",
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(
    null
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAppSettings();
      setSettings(response.data.settings);
      setOriginalSettings(response.data.settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (
    key: keyof AppSettings,
    value: string | number
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Check if there are changes
    const hasChanges = originalSettings
      ? JSON.stringify(newSettings) !== JSON.stringify(originalSettings)
      : false;
    setHasChanges(hasChanges);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.updateAppSettings(settings);
      toast.success("Settings updated successfully");
      setOriginalSettings(settings);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setHasChanges(false);
    }
  };

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
                        <span>Loading settings...</span>
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
                        App Settings
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Configure business settings and delivery preferences
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={fetchSettings} variant="outline">
                        <IconRefresh className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                      >
                        {isSaving ? (
                          <>
                            <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <IconDeviceFloppy className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {hasChanges && (
                    <div className="mb-6">
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                      >
                        You have unsaved changes
                      </Badge>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tax & Currency Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconCurrency className="h-5 w-5" />
                          Tax & Currency
                        </CardTitle>
                        <CardDescription>
                          Configure tax rates and currency settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="taxRate">Tax Rate (%)</Label>
                          <Input
                            id="taxRate"
                            type="number"
                            step="0.1"
                            value={settings.taxRate}
                            onChange={(e) =>
                              handleSettingChange(
                                "taxRate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="10.0"
                          />
                          <p className="text-xs text-muted-foreground">
                            Applied to all orders
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currencySymbol">
                              Currency Symbol
                            </Label>
                            <Input
                              id="currencySymbol"
                              value={settings.currencySymbol}
                              onChange={(e) =>
                                handleSettingChange(
                                  "currencySymbol",
                                  e.target.value
                                )
                              }
                              placeholder="₵"
                              maxLength={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currencyCode">Currency Code</Label>
                            <Input
                              id="currencyCode"
                              value={settings.currencyCode}
                              onChange={(e) =>
                                handleSettingChange(
                                  "currencyCode",
                                  e.target.value
                                )
                              }
                              placeholder="GHS"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Shipping Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconTruck className="h-5 w-5" />
                          Shipping Settings
                        </CardTitle>
                        <CardDescription>
                          Configure free shipping and delivery fees
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="freeShippingThreshold">
                            Free Shipping Threshold ({settings.currencySymbol})
                          </Label>
                          <Input
                            id="freeShippingThreshold"
                            type="number"
                            step="0.01"
                            value={settings.freeShippingThreshold}
                            onChange={(e) =>
                              handleSettingChange(
                                "freeShippingThreshold",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="100.00"
                          />
                          <p className="text-xs text-muted-foreground">
                            Orders above this amount get free shipping
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="largeOrderQuantityThreshold">
                            Large Order Quantity Threshold
                          </Label>
                          <Input
                            id="largeOrderQuantityThreshold"
                            type="number"
                            value={settings.largeOrderQuantityThreshold}
                            onChange={(e) =>
                              handleSettingChange(
                                "largeOrderQuantityThreshold",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="10"
                          />
                          <p className="text-xs text-muted-foreground">
                            Orders with this many items or more are considered
                            large
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="largeOrderDeliveryFee">
                            Large Order Delivery Fee ({settings.currencySymbol})
                          </Label>
                          <Input
                            id="largeOrderDeliveryFee"
                            type="number"
                            step="0.01"
                            value={settings.largeOrderDeliveryFee}
                            onChange={(e) =>
                              handleSettingChange(
                                "largeOrderDeliveryFee",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="50.00"
                          />
                          <p className="text-xs text-muted-foreground">
                            Additional fee for large orders
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Settings Summary */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconSettings className="h-5 w-5" />
                          Current Settings Summary
                        </CardTitle>
                        <CardDescription>
                          Overview of your current business configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Tax Rate</p>
                            <p className="text-2xl font-bold">
                              {settings.taxRate}%
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Free Shipping</p>
                            <p className="text-2xl font-bold">
                              {settings.currencySymbol}
                              {settings.freeShippingThreshold}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Large Order</p>
                            <p className="text-2xl font-bold">
                              {settings.largeOrderQuantityThreshold}+ items
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Currency</p>
                            <p className="text-2xl font-bold">
                              {settings.currencySymbol} ({settings.currencyCode}
                              )
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Last updated:{" "}
                            {new Date(settings.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  {hasChanges && (
                    <div className="flex justify-end gap-2 mt-6">
                      <Button onClick={handleReset} variant="outline">
                        Reset Changes
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <IconDeviceFloppy className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
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
