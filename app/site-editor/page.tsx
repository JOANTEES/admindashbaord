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
import { Textarea } from "@/components/ui/textarea"
import { IconEdit, IconEye, IconDownload } from "@tabler/icons-react"

export default function SiteEditorPage() {
  const [siteContent, setSiteContent] = useState({
    headline: "Welcome to Our Fashion Store",
    subheadline: "Discover the latest trends in fashion and style. Shop our curated collection of clothing and accessories.",
    bannerImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop"
  })

  const [previewMode, setPreviewMode] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setSiteContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to a backend
    console.log("Saving site content:", siteContent)
    // For demo purposes, just show an alert
    alert("Site content updated! (This is just a demo - no actual saving)")
  }

  return (
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
                  <h1 className="text-3xl font-bold text-foreground">Site Editor</h1>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <IconEye className="h-4 w-4 mr-2" />
                      {previewMode ? "Edit Mode" : "Preview"}
                    </Button>
                    <Button 
                      className="bg-primary text-background hover:bg-primary/90"
                      onClick={handleSave}
                    >
                      <IconDownload className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Edit Form */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconEdit className="h-5 w-5" />
                          Edit Homepage Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="headline">Headline</Label>
                          <Input
                            id="headline"
                            value={siteContent.headline}
                            onChange={(e) => handleInputChange("headline", e.target.value)}
                            placeholder="Enter main headline"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="subheadline">Subheadline</Label>
                          <Textarea
                            id="subheadline"
                            value={siteContent.subheadline}
                            onChange={(e) => handleInputChange("subheadline", e.target.value)}
                            placeholder="Enter subheadline text"
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
                          <Input
                            id="bannerImageUrl"
                            value={siteContent.bannerImageUrl}
                            onChange={(e) => handleInputChange("bannerImageUrl", e.target.value)}
                            placeholder="Enter banner image URL"
                            className="mt-1"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Additional Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="metaTitle">Meta Title</Label>
                          <Input
                            id="metaTitle"
                            placeholder="SEO meta title"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="metaDescription">Meta Description</Label>
                          <Textarea
                            id="metaDescription"
                            placeholder="SEO meta description"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                          {/* Banner Image */}
                          <div className="relative h-48 bg-gray-100">
                            {siteContent.bannerImageUrl ? (
                              <img
                                src={siteContent.bannerImageUrl}
                                alt="Banner"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling!.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-full h-full flex items-center justify-center text-gray-500"
                              style={{ display: siteContent.bannerImageUrl ? 'none' : 'flex' }}
                            >
                              Banner Image Preview
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-6 bg-white">
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                              {siteContent.headline || "Your Headline Here"}
                            </h1>
                            <p className="text-gray-600 leading-relaxed">
                              {siteContent.subheadline || "Your subheadline text will appear here..."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Content Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Headline Length:</span>
                            <span className="text-sm font-medium">
                              {siteContent.headline.length} characters
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Subheadline Length:</span>
                            <span className="text-sm font-medium">
                              {siteContent.subheadline.length} characters
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Image URL:</span>
                            <span className="text-sm font-medium">
                              {siteContent.bannerImageUrl ? "Set" : "Not set"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 