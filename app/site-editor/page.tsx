"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { Switch } from "@/components/ui/switch"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image";
import {
  IconEdit,
  IconEye,
  IconDownload,
  IconPlus,
  IconTrash,
  IconLink,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandPinterest,
  IconBrandSnapchat,
  IconBrandDiscord,
  IconBrandTelegram,
  IconSettings,
  IconPalette,
  IconLayout,
  IconSeo,
} from "@tabler/icons-react";

interface FooterLink {
  id: string;
  title: string;
  url: string;
  target: "_blank" | "_self";
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}

export default function SiteEditorPage() {
  const [activeTab, setActiveTab] = useState("homepage");
  const [previewMode, setPreviewMode] = useState(false);

  // Homepage content
  const [siteContent, setSiteContent] = useState({
    headline: "Welcome to Joantees",
    subheadline:
      "Discover the latest trends in fashion and style. Shop our curated collection of clothing and accessories.",
    bannerImageUrl: "",
    metaTitle: "Joantees - Fashion Store",
    metaDescription:
      "Discover the latest trends in fashion and style at Joantees. Shop our curated collection of clothing and accessories.",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    fontFamily: "Inter",
    headingFont: "Inter",
    bodyFont: "Inter",
    fontSize: "16px",
    lineHeight: "1.6",
    borderRadius: "8px",
    shadowIntensity: "medium",
  });

  // Footer content
  const [footerContent, setFooterContent] = useState({
    companyName: "Joantees",
    description:
      "Your premier destination for fashion and style. We bring you the latest trends and timeless classics.",
    address: "123 Fashion Street, Style City, SC 12345",
    phone: "+1 (555) 123-4567",
    email: "info@joantees.com",
    copyright: "© 2024 Joantees. All rights reserved.",
    showNewsletter: true,
    newsletterTitle: "Subscribe to our newsletter",
    newsletterDescription:
      "Get the latest fashion updates and exclusive offers.",
  });

  // Footer links
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([
    { id: "1", title: "About Us", url: "/about", target: "_self" },
    { id: "2", title: "Contact", url: "/contact", target: "_self" },
    { id: "3", title: "Shipping Info", url: "/shipping", target: "_self" },
    { id: "4", title: "Returns", url: "/returns", target: "_self" },
    { id: "5", title: "Privacy Policy", url: "/privacy", target: "_self" },
    { id: "6", title: "Terms of Service", url: "/terms", target: "_self" },
  ]);

  // Social media links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      id: "1",
      platform: "Facebook",
      url: "https://facebook.com/joantees",
      icon: "facebook",
    },
    {
      id: "2",
      platform: "Instagram",
      url: "https://instagram.com/joantees",
      icon: "instagram",
    },
    {
      id: "3",
      platform: "Twitter",
      url: "https://twitter.com/joantees",
      icon: "twitter",
    },
    {
      id: "4",
      platform: "YouTube",
      url: "https://youtube.com/joantees",
      icon: "youtube",
    },
  ]);

  // Pages content
  const [pages, setPages] = useState<PageContent[]>([
    {
      id: "1",
      title: "About Us",
      slug: "about",
      content:
        "<h1>About Joantees</h1><p>We are passionate about fashion and committed to bringing you the best in style and quality.</p>",
      metaTitle: "About Us - Joantees",
      metaDescription:
        "Learn about Joantees, your premier fashion destination.",
      isPublished: true,
    },
    {
      id: "2",
      title: "Contact",
      slug: "contact",
      content:
        "<h1>Contact Us</h1><p>Get in touch with us for any questions or support.</p>",
      metaTitle: "Contact Us - Joantees",
      metaDescription: "Contact Joantees for support and inquiries.",
      isPublished: true,
    },
  ]);

  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [isAddSocialDialogOpen, setIsAddSocialDialogOpen] = useState(false);
  const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    target: "_self" as "_self" | "_blank",
  });
  const [newSocial, setNewSocial] = useState({
    platform: "",
    url: "",
    icon: "",
  });
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
  });

  // Predefined color schemes
  const colorSchemes = [
    {
      name: "Ocean Blue",
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#06b6d4",
      background: "#ffffff",
      text: "#1f2937",
    },
    {
      name: "Forest Green",
      primary: "#10b981",
      secondary: "#047857",
      accent: "#f59e0b",
      background: "#ffffff",
      text: "#1f2937",
    },
    {
      name: "Sunset Orange",
      primary: "#f97316",
      secondary: "#ea580c",
      accent: "#eab308",
      background: "#ffffff",
      text: "#1f2937",
    },
    {
      name: "Royal Purple",
      primary: "#8b5cf6",
      secondary: "#7c3aed",
      accent: "#ec4899",
      background: "#ffffff",
      text: "#1f2937",
    },
    {
      name: "Midnight Dark",
      primary: "#6366f1",
      secondary: "#4f46e5",
      accent: "#f59e0b",
      background: "#1f2937",
      text: "#f9fafb",
    },
    {
      name: "Rose Gold",
      primary: "#ec4899",
      secondary: "#be185d",
      accent: "#f59e0b",
      background: "#fef7f0",
      text: "#1f2937",
    },
  ];

  const fontOptions = [
    { name: "Inter", category: "Sans-serif", weight: "400, 500, 600, 700" },
    { name: "Roboto", category: "Sans-serif", weight: "300, 400, 500, 700" },
    { name: "Open Sans", category: "Sans-serif", weight: "300, 400, 600, 700" },
    { name: "Lato", category: "Sans-serif", weight: "300, 400, 700" },
    {
      name: "Montserrat",
      category: "Sans-serif",
      weight: "300, 400, 500, 600, 700",
    },
    {
      name: "Poppins",
      category: "Sans-serif",
      weight: "300, 400, 500, 600, 700",
    },
    {
      name: "Playfair Display",
      category: "Serif",
      weight: "400, 500, 600, 700",
    },
    { name: "Merriweather", category: "Serif", weight: "300, 400, 700" },
    {
      name: "Source Code Pro",
      category: "Monospace",
      weight: "300, 400, 500, 600",
    },
    { name: "Fira Code", category: "Monospace", weight: "300, 400, 500, 600" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setSiteContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFooterChange = (field: string, value: string | boolean) => {
    setFooterContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFooterLink = () => {
    const link: FooterLink = {
      id: Date.now().toString(),
      ...newLink,
    };
    setFooterLinks((prev) => [...prev, link]);
    setNewLink({ title: "", url: "", target: "_self" as "_self" | "_blank" });
    setIsAddLinkDialogOpen(false);
  };

  const removeFooterLink = (id: string) => {
    setFooterLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const addSocialLink = () => {
    const social: SocialLink = {
      id: Date.now().toString(),
      ...newSocial,
    };
    setSocialLinks((prev) => [...prev, social]);
    setNewSocial({ platform: "", url: "", icon: "" });
    setIsAddSocialDialogOpen(false);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const updateSocialLink = (
    id: string,
    field: keyof SocialLink,
    value: string
  ) => {
    setSocialLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const addPage = () => {
    const page: PageContent = {
      id: Date.now().toString(),
      ...newPage,
      isPublished: false,
    };
    setPages((prev) => [...prev, page]);
    setNewPage({
      title: "",
      slug: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
    });
    setIsAddPageDialogOpen(false);
  };

  const updatePage = (id: string, updates: Partial<PageContent>) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, ...updates } : page))
    );
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
  };

  const handleSave = async () => {
    try {
      // Show loading state
      console.log("Saving site content:", {
        siteContent,
        footerContent,
        footerLinks,
        socialLinks,
        pages,
      });

      // In a real implementation, you would:
      // 1. Send data to your backend API
      // 2. Update your website's CSS variables
      // 3. Regenerate static pages if needed
      // 4. Update database with new settings

      // Real API call to save site settings
      const response = await fetch("/api/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({
          siteContent,
          footerContent,
          footerLinks,
          socialLinks,
          pages,
        }),
      });

      if (response.ok) {
        await response.json();
        alert("✅ Website updated successfully!");

        // Optionally redirect to the updated website
        // window.open('https://yourwebsite.com', '_blank')
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Failed to save changes. Please try again.");
    }
  };

  const handlePreviewLive = () => {
    // This would open your actual website in a new tab
    // Replace with your actual website URL
    const websiteUrl = "https://yourwebsite.com"; // Replace with your actual URL
    window.open(websiteUrl, "_blank");
  };

  const getSocialIcon = (icon: string) => {
    switch (icon) {
      case "facebook":
        return <IconBrandFacebook className="h-4 w-4" />;
      case "instagram":
        return <IconBrandInstagram className="h-4 w-4" />;
      case "twitter":
        return <IconBrandTwitter className="h-4 w-4" />;
      case "youtube":
        return <IconBrandYoutube className="h-4 w-4" />;
      case "linkedin":
        return <IconBrandLinkedin className="h-4 w-4" />;
      case "tiktok":
        return <IconBrandTiktok className="h-4 w-4" />;
      case "pinterest":
        return <IconBrandPinterest className="h-4 w-4" />;
      case "snapchat":
        return <IconBrandSnapchat className="h-4 w-4" />;
      case "discord":
        return <IconBrandDiscord className="h-4 w-4" />;
      case "telegram":
        return <IconBrandTelegram className="h-4 w-4" />;
      default:
        return <IconLink className="h-4 w-4" />;
    }
  };

  const applyColorScheme = (scheme: (typeof colorSchemes)[0]) => {
    setSiteContent((prev) => ({
      ...prev,
      primaryColor: scheme.primary,
      secondaryColor: scheme.secondary,
      accentColor: scheme.accent,
      backgroundColor: scheme.background,
      textColor: scheme.text,
    }));
  };

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
                  Site Editor
                </h2>
                <p className="text-muted-foreground">
                  Manage your website content, design, and settings
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <IconEye className="h-4 w-4 mr-2" />
                  {previewMode ? "Edit Mode" : "Preview"}
                </Button>
                <Button variant="outline" onClick={handlePreviewLive}>
                  <IconLink className="h-4 w-4 mr-2" />
                  View Live Site
                </Button>
                <Button onClick={handleSave}>
                  <IconDownload className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="homepage">Homepage</TabsTrigger>
                <TabsTrigger value="footer">Footer</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* Homepage Tab */}
              <TabsContent value="homepage" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconEdit className="h-5 w-5" />
                        Homepage Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="headline">Headline</Label>
                        <Input
                          id="headline"
                          value={siteContent.headline}
                          onChange={(e) =>
                            handleInputChange("headline", e.target.value)
                          }
                          placeholder="Enter main headline"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="subheadline">Subheadline</Label>
                        <Textarea
                          id="subheadline"
                          value={siteContent.subheadline}
                          onChange={(e) =>
                            handleInputChange("subheadline", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleInputChange("bannerImageUrl", e.target.value)
                          }
                          placeholder="Enter banner image URL"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="relative h-48 bg-gray-100">
                          {siteContent.bannerImageUrl ? (
                            <Image
                              src={siteContent.bannerImageUrl}
                              alt="Banner"
                              width={600}
                              height={192}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                                const nextElement =
                                  target.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex items-center justify-center text-gray-500"
                            style={{
                              display: siteContent.bannerImageUrl
                                ? "none"
                                : "flex",
                            }}
                          >
                            Banner Image Preview
                          </div>
                        </div>

                        <div className="p-6 bg-white">
                          <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            {siteContent.headline || "Your Headline Here"}
                          </h1>
                          <p className="text-gray-600 leading-relaxed">
                            {siteContent.subheadline ||
                              "Your subheadline text will appear here..."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Footer Tab */}
              <TabsContent value="footer" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Footer Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            value={footerContent.companyName}
                            onChange={(e) =>
                              handleFooterChange("companyName", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={footerContent.description}
                            onChange={(e) =>
                              handleFooterChange("description", e.target.value)
                            }
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={footerContent.address}
                            onChange={(e) =>
                              handleFooterChange("address", e.target.value)
                            }
                            className="mt-1"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={footerContent.phone}
                              onChange={(e) =>
                                handleFooterChange("phone", e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={footerContent.email}
                              onChange={(e) =>
                                handleFooterChange("email", e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="copyright">Copyright Text</Label>
                          <Input
                            id="copyright"
                            value={footerContent.copyright}
                            onChange={(e) =>
                              handleFooterChange("copyright", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="showNewsletter"
                            checked={footerContent.showNewsletter}
                            onChange={(e) =>
                              handleFooterChange(
                                "showNewsletter",
                                e.target.checked
                              )
                            }
                            className="rounded"
                          />
                          <Label htmlFor="showNewsletter">
                            Show Newsletter Signup
                          </Label>
                        </div>

                        {footerContent.showNewsletter && (
                          <>
                            <div>
                              <Label htmlFor="newsletterTitle">
                                Newsletter Title
                              </Label>
                              <Input
                                id="newsletterTitle"
                                value={footerContent.newsletterTitle}
                                onChange={(e) =>
                                  handleFooterChange(
                                    "newsletterTitle",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="newsletterDescription">
                                Newsletter Description
                              </Label>
                              <Textarea
                                id="newsletterDescription"
                                value={footerContent.newsletterDescription}
                                onChange={(e) =>
                                  handleFooterChange(
                                    "newsletterDescription",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Footer Links</CardTitle>
                          <Dialog
                            open={isAddLinkDialogOpen}
                            onOpenChange={setIsAddLinkDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <IconPlus className="h-4 w-4 mr-2" />
                                Add Link
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Footer Link</DialogTitle>
                                <DialogDescription>
                                  Add a new link to your footer navigation
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="linkTitle">Title</Label>
                                  <Input
                                    id="linkTitle"
                                    value={newLink.title}
                                    onChange={(e) =>
                                      setNewLink({
                                        ...newLink,
                                        title: e.target.value,
                                      })
                                    }
                                    placeholder="Link title"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="linkUrl">URL</Label>
                                  <Input
                                    id="linkUrl"
                                    value={newLink.url}
                                    onChange={(e) =>
                                      setNewLink({
                                        ...newLink,
                                        url: e.target.value,
                                      })
                                    }
                                    placeholder="/page or https://example.com"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="linkTarget">Target</Label>
                                  <Select
                                    value={newLink.target}
                                    onValueChange={(
                                      value: "_self" | "_blank"
                                    ) =>
                                      setNewLink({ ...newLink, target: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="_self">
                                        Same Window
                                      </SelectItem>
                                      <SelectItem value="_blank">
                                        New Window
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      setIsAddLinkDialogOpen(false)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={addFooterLink}>
                                    Add Link
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {footerLinks.map((link) => (
                            <div
                              key={link.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{link.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {link.url}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFooterLink(link.id)}
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Social Media Links</CardTitle>
                          <Dialog
                            open={isAddSocialDialogOpen}
                            onOpenChange={setIsAddSocialDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <IconPlus className="h-4 w-4 mr-2" />
                                Add Social
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Social Media Link</DialogTitle>
                                <DialogDescription>
                                  Add a social media link to your footer
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="socialPlatform">
                                    Platform
                                  </Label>
                                  <Select
                                    value={newSocial.platform}
                                    onValueChange={(value) =>
                                      setNewSocial({
                                        ...newSocial,
                                        platform: value,
                                        icon: value.toLowerCase(),
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Facebook">
                                        Facebook
                                      </SelectItem>
                                      <SelectItem value="Instagram">
                                        Instagram
                                      </SelectItem>
                                      <SelectItem value="Twitter">
                                        Twitter
                                      </SelectItem>
                                      <SelectItem value="YouTube">
                                        YouTube
                                      </SelectItem>
                                      <SelectItem value="LinkedIn">
                                        LinkedIn
                                      </SelectItem>
                                      <SelectItem value="TikTok">
                                        TikTok
                                      </SelectItem>
                                      <SelectItem value="Pinterest">
                                        Pinterest
                                      </SelectItem>
                                      <SelectItem value="Snapchat">
                                        Snapchat
                                      </SelectItem>
                                      <SelectItem value="Discord">
                                        Discord
                                      </SelectItem>
                                      <SelectItem value="Telegram">
                                        Telegram
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="socialUrl">URL</Label>
                                  <Input
                                    id="socialUrl"
                                    value={newSocial.url}
                                    onChange={(e) =>
                                      setNewSocial({
                                        ...newSocial,
                                        url: e.target.value,
                                      })
                                    }
                                    placeholder="https://example.com"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      setIsAddSocialDialogOpen(false)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={addSocialLink}>
                                    Add Social Link
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {socialLinks.map((social) => (
                            <div
                              key={social.id}
                              className="p-4 border rounded-lg space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {getSocialIcon(social.icon)}
                                  <h4 className="font-medium">
                                    Edit {social.platform}
                                  </h4>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeSocialLink(social.id)}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`platform-${social.id}`}>
                                    Platform
                                  </Label>
                                  <Select
                                    value={social.platform}
                                    onValueChange={(value) =>
                                      updateSocialLink(
                                        social.id,
                                        "platform",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Facebook">
                                        Facebook
                                      </SelectItem>
                                      <SelectItem value="Instagram">
                                        Instagram
                                      </SelectItem>
                                      <SelectItem value="Twitter">
                                        Twitter
                                      </SelectItem>
                                      <SelectItem value="YouTube">
                                        YouTube
                                      </SelectItem>
                                      <SelectItem value="LinkedIn">
                                        LinkedIn
                                      </SelectItem>
                                      <SelectItem value="TikTok">
                                        TikTok
                                      </SelectItem>
                                      <SelectItem value="Pinterest">
                                        Pinterest
                                      </SelectItem>
                                      <SelectItem value="Snapchat">
                                        Snapchat
                                      </SelectItem>
                                      <SelectItem value="Discord">
                                        Discord
                                      </SelectItem>
                                      <SelectItem value="Telegram">
                                        Telegram
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor={`url-${social.id}`}>
                                    URL
                                  </Label>
                                  <Input
                                    id={`url-${social.id}`}
                                    value={social.url}
                                    onChange={(e) =>
                                      updateSocialLink(
                                        social.id,
                                        "url",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://example.com"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Label htmlFor={`icon-${social.id}`}>
                                  Icon
                                </Label>
                                <Select
                                  value={social.icon}
                                  onValueChange={(value) =>
                                    updateSocialLink(social.id, "icon", value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select icon" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="facebook">
                                      Facebook
                                    </SelectItem>
                                    <SelectItem value="instagram">
                                      Instagram
                                    </SelectItem>
                                    <SelectItem value="twitter">
                                      Twitter
                                    </SelectItem>
                                    <SelectItem value="youtube">
                                      YouTube
                                    </SelectItem>
                                    <SelectItem value="linkedin">
                                      LinkedIn
                                    </SelectItem>
                                    <SelectItem value="tiktok">
                                      TikTok
                                    </SelectItem>
                                    <SelectItem value="pinterest">
                                      Pinterest
                                    </SelectItem>
                                    <SelectItem value="snapchat">
                                      Snapchat
                                    </SelectItem>
                                    <SelectItem value="discord">
                                      Discord
                                    </SelectItem>
                                    <SelectItem value="telegram">
                                      Telegram
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="ml-2">
                                  {getSocialIcon(social.icon)}
                                </div>
                              </div>
                            </div>
                          ))}

                          {socialLinks.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <IconBrandFacebook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No social media links added yet</p>
                              <p className="text-sm">
                                Click &quot;Add Social&quot; to get started
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Footer Preview</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          <IconLink className="h-3 w-3 mr-1" />
                          Connected to Live Site
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-900 text-white p-6 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h3 className="font-bold text-lg mb-3">
                              {footerContent.companyName}
                            </h3>
                            <p className="text-gray-300 text-sm mb-4">
                              {footerContent.description}
                            </p>
                            <div className="space-y-2 text-sm text-gray-300">
                              <div className="flex items-center space-x-2">
                                <IconMapPin className="h-4 w-4" />
                                <span>{footerContent.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <IconPhone className="h-4 w-4" />
                                <span>{footerContent.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <IconMail className="h-4 w-4" />
                                <span>{footerContent.email}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Quick Links</h4>
                            <div className="space-y-2">
                              {footerLinks.slice(0, 4).map((link) => (
                                <div key={link.id}>
                                  <a
                                    href={link.url}
                                    className="text-gray-300 hover:text-white text-sm"
                                  >
                                    {link.title}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Follow Us</h4>
                            <div className="flex space-x-3">
                              {socialLinks.map((social) => (
                                <a
                                  key={social.id}
                                  href={social.url}
                                  className="text-gray-300 hover:text-white"
                                >
                                  {getSocialIcon(social.icon)}
                                </a>
                              ))}
                            </div>

                            {footerContent.showNewsletter && (
                              <div className="mt-6">
                                <h4 className="font-semibold mb-2">
                                  {footerContent.newsletterTitle}
                                </h4>
                                <p className="text-gray-300 text-sm mb-3">
                                  {footerContent.newsletterDescription}
                                </p>
                                <div className="flex">
                                  <Input
                                    placeholder="Enter email"
                                    className="bg-gray-800 border-gray-700"
                                  />
                                  <Button size="sm" className="ml-2">
                                    Subscribe
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="my-6 bg-gray-700" />

                        <div className="flex justify-between items-center text-sm text-gray-300">
                          <span>{footerContent.copyright}</span>
                          <div className="flex space-x-4">
                            {footerLinks.slice(4).map((link) => (
                              <a
                                key={link.id}
                                href={link.url}
                                className="hover:text-white"
                              >
                                {link.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center text-blue-800 text-sm">
                          <IconLink className="h-4 w-4 mr-2" />
                          <span className="font-medium">Live Connection:</span>
                          <span className="ml-2">
                            This preview will automatically sync with your
                            website footer when you save changes.
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Pages Tab */}
              <TabsContent value="pages" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Website Pages</CardTitle>
                          <Dialog
                            open={isAddPageDialogOpen}
                            onOpenChange={setIsAddPageDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <IconPlus className="h-4 w-4 mr-2" />
                                Add Page
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Create New Page</DialogTitle>
                                <DialogDescription>
                                  Create a new page for your website
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="pageTitle">
                                      Page Title
                                    </Label>
                                    <Input
                                      id="pageTitle"
                                      value={newPage.title}
                                      onChange={(e) =>
                                        setNewPage({
                                          ...newPage,
                                          title: e.target.value,
                                        })
                                      }
                                      placeholder="About Us"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="pageSlug">URL Slug</Label>
                                    <Input
                                      id="pageSlug"
                                      value={newPage.slug}
                                      onChange={(e) =>
                                        setNewPage({
                                          ...newPage,
                                          slug: e.target.value,
                                        })
                                      }
                                      placeholder="about-us"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="pageContent">Content</Label>
                                  <Textarea
                                    id="pageContent"
                                    value={newPage.content}
                                    onChange={(e) =>
                                      setNewPage({
                                        ...newPage,
                                        content: e.target.value,
                                      })
                                    }
                                    placeholder="<h1>Page Title</h1><p>Page content...</p>"
                                    rows={6}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="pageMetaTitle">
                                    Meta Title
                                  </Label>
                                  <Input
                                    id="pageMetaTitle"
                                    value={newPage.metaTitle}
                                    onChange={(e) =>
                                      setNewPage({
                                        ...newPage,
                                        metaTitle: e.target.value,
                                      })
                                    }
                                    placeholder="SEO title"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="pageMetaDescription">
                                    Meta Description
                                  </Label>
                                  <Textarea
                                    id="pageMetaDescription"
                                    value={newPage.metaDescription}
                                    onChange={(e) =>
                                      setNewPage({
                                        ...newPage,
                                        metaDescription: e.target.value,
                                      })
                                    }
                                    placeholder="SEO description"
                                    rows={2}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      setIsAddPageDialogOpen(false)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={addPage}>Create Page</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {pages.map((page) => (
                            <div
                              key={page.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{page.title}</h4>
                                  <Badge
                                    variant={
                                      page.isPublished ? "default" : "outline"
                                    }
                                  >
                                    {page.isPublished ? "Published" : "Draft"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  /{page.slug}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPage(page)}
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removePage(page.id)}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedPage && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Edit Page: {selectedPage.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="editPageTitle">Page Title</Label>
                          <Input
                            id="editPageTitle"
                            value={selectedPage.title}
                            onChange={(e) =>
                              updatePage(selectedPage.id, {
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="editPageSlug">URL Slug</Label>
                          <Input
                            id="editPageSlug"
                            value={selectedPage.slug}
                            onChange={(e) =>
                              updatePage(selectedPage.id, {
                                slug: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="editPageContent">Content</Label>
                          <Textarea
                            id="editPageContent"
                            value={selectedPage.content}
                            onChange={(e) =>
                              updatePage(selectedPage.id, {
                                content: e.target.value,
                              })
                            }
                            rows={8}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editPageMetaTitle">Meta Title</Label>
                          <Input
                            id="editPageMetaTitle"
                            value={selectedPage.metaTitle}
                            onChange={(e) =>
                              updatePage(selectedPage.id, {
                                metaTitle: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="editPageMetaDescription">
                            Meta Description
                          </Label>
                          <Textarea
                            id="editPageMetaDescription"
                            value={selectedPage.metaDescription}
                            onChange={(e) =>
                              updatePage(selectedPage.id, {
                                metaDescription: e.target.value,
                              })
                            }
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="editPagePublished"
                            checked={selectedPage.isPublished}
                            onChange={(e) =>
                              updatePage(selectedPage.id, {
                                isPublished: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <Label htmlFor="editPagePublished">Published</Label>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Color Schemes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconPalette className="h-5 w-5" />
                        Color Schemes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {colorSchemes.map((scheme, index) => (
                          <div
                            key={index}
                            className="cursor-pointer border rounded-lg p-3 hover:border-primary transition-colors"
                            onClick={() => applyColorScheme(scheme)}
                          >
                            <div className="flex space-x-1 mb-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: scheme.secondary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: scheme.accent }}
                              />
                            </div>
                            <p className="text-sm font-medium">{scheme.name}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSettings className="h-5 w-5" />
                        Custom Colors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="primaryColor"
                            value={siteContent.primaryColor}
                            onChange={(e) =>
                              handleInputChange("primaryColor", e.target.value)
                            }
                            className="flex-1"
                          />
                          <input
                            type="color"
                            value={siteContent.primaryColor}
                            onChange={(e) =>
                              handleInputChange("primaryColor", e.target.value)
                            }
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="secondaryColor"
                            value={siteContent.secondaryColor}
                            onChange={(e) =>
                              handleInputChange(
                                "secondaryColor",
                                e.target.value
                              )
                            }
                            className="flex-1"
                          />
                          <input
                            type="color"
                            value={siteContent.secondaryColor}
                            onChange={(e) =>
                              handleInputChange(
                                "secondaryColor",
                                e.target.value
                              )
                            }
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="accentColor"
                            value={siteContent.accentColor}
                            onChange={(e) =>
                              handleInputChange("accentColor", e.target.value)
                            }
                            className="flex-1"
                          />
                          <input
                            type="color"
                            value={siteContent.accentColor}
                            onChange={(e) =>
                              handleInputChange("accentColor", e.target.value)
                            }
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="backgroundColor">
                          Background Color
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="backgroundColor"
                            value={siteContent.backgroundColor}
                            onChange={(e) =>
                              handleInputChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                            className="flex-1"
                          />
                          <input
                            type="color"
                            value={siteContent.backgroundColor}
                            onChange={(e) =>
                              handleInputChange(
                                "backgroundColor",
                                e.target.value
                              )
                            }
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="textColor"
                            value={siteContent.textColor}
                            onChange={(e) =>
                              handleInputChange("textColor", e.target.value)
                            }
                            className="flex-1"
                          />
                          <input
                            type="color"
                            value={siteContent.textColor}
                            onChange={(e) =>
                              handleInputChange("textColor", e.target.value)
                            }
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Typography */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconLayout className="h-5 w-5" />
                        Typography
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="headingFont">Heading Font</Label>
                        <Select
                          value={siteContent.headingFont}
                          onValueChange={(value) =>
                            handleInputChange("headingFont", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((font) => (
                              <SelectItem key={font.name} value={font.name}>
                                <div>
                                  <div className="font-medium">{font.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {font.category}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="bodyFont">Body Font</Label>
                        <Select
                          value={siteContent.bodyFont}
                          onValueChange={(value) =>
                            handleInputChange("bodyFont", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((font) => (
                              <SelectItem key={font.name} value={font.name}>
                                <div>
                                  <div className="font-medium">{font.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {font.category}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fontSize">Base Font Size</Label>
                        <Select
                          value={siteContent.fontSize}
                          onValueChange={(value) =>
                            handleInputChange("fontSize", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="14px">14px (Small)</SelectItem>
                            <SelectItem value="16px">16px (Medium)</SelectItem>
                            <SelectItem value="18px">18px (Large)</SelectItem>
                            <SelectItem value="20px">
                              20px (Extra Large)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="lineHeight">Line Height</Label>
                        <Select
                          value={siteContent.lineHeight}
                          onValueChange={(value) =>
                            handleInputChange("lineHeight", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1.4">1.4 (Tight)</SelectItem>
                            <SelectItem value="1.6">1.6 (Normal)</SelectItem>
                            <SelectItem value="1.8">1.8 (Relaxed)</SelectItem>
                            <SelectItem value="2.0">2.0 (Loose)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="borderRadius">Border Radius</Label>
                        <Select
                          value={siteContent.borderRadius}
                          onValueChange={(value) =>
                            handleInputChange("borderRadius", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0px">0px (Sharp)</SelectItem>
                            <SelectItem value="4px">4px (Subtle)</SelectItem>
                            <SelectItem value="8px">8px (Rounded)</SelectItem>
                            <SelectItem value="12px">
                              12px (Very Rounded)
                            </SelectItem>
                            <SelectItem value="16px">16px (Pill)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="shadowIntensity">
                          Shadow Intensity
                        </Label>
                        <Select
                          value={siteContent.shadowIntensity}
                          onValueChange={(value) =>
                            handleInputChange("shadowIntensity", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="subtle">Subtle</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="strong">Strong</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Design Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="border rounded-lg overflow-hidden"
                      style={{
                        backgroundColor: siteContent.backgroundColor,
                        borderRadius: siteContent.borderRadius,
                        boxShadow:
                          siteContent.shadowIntensity === "none"
                            ? "none"
                            : siteContent.shadowIntensity === "subtle"
                            ? "0 1px 3px rgba(0,0,0,0.1)"
                            : siteContent.shadowIntensity === "medium"
                            ? "0 4px 6px rgba(0,0,0,0.1)"
                            : "0 10px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                      {/* Header */}
                      <div
                        className="h-24 flex items-center justify-center text-white font-bold px-6"
                        style={{
                          backgroundColor: siteContent.primaryColor,
                          fontFamily: siteContent.headingFont,
                        }}
                      >
                        <h1 className="text-2xl">Your Brand</h1>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div
                          className="mb-4"
                          style={{
                            fontFamily: siteContent.headingFont,
                            color: siteContent.textColor,
                            fontSize: "1.5rem",
                            lineHeight: siteContent.lineHeight,
                          }}
                        >
                          <h2 className="font-semibold mb-2">Sample Heading</h2>
                          <p
                            className="text-sm mb-4"
                            style={{
                              fontFamily: siteContent.bodyFont,
                              color: siteContent.textColor,
                              fontSize: siteContent.fontSize,
                              lineHeight: siteContent.lineHeight,
                            }}
                          >
                            This is how your body text will appear with the
                            selected typography settings.
                          </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                          <button
                            className="px-4 py-2 text-white font-medium rounded"
                            style={{
                              backgroundColor: siteContent.primaryColor,
                              borderRadius: siteContent.borderRadius,
                            }}
                          >
                            Primary Button
                          </button>
                          <button
                            className="px-4 py-2 font-medium border rounded"
                            style={{
                              backgroundColor: siteContent.secondaryColor,
                              color: "#ffffff",
                              borderRadius: siteContent.borderRadius,
                              border: `1px solid ${siteContent.secondaryColor}`,
                            }}
                          >
                            Secondary Button
                          </button>
                          <button
                            className="px-4 py-2 font-medium rounded"
                            style={{
                              backgroundColor: siteContent.accentColor,
                              color: "#ffffff",
                              borderRadius: siteContent.borderRadius,
                            }}
                          >
                            Accent Button
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Color Palette */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Color Palette</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-lg border mx-auto mb-2"
                          style={{ backgroundColor: siteContent.primaryColor }}
                        />
                        <p className="text-sm font-medium">Primary</p>
                        <p className="text-xs text-muted-foreground">
                          {siteContent.primaryColor}
                        </p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-lg border mx-auto mb-2"
                          style={{
                            backgroundColor: siteContent.secondaryColor,
                          }}
                        />
                        <p className="text-sm font-medium">Secondary</p>
                        <p className="text-xs text-muted-foreground">
                          {siteContent.secondaryColor}
                        </p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-lg border mx-auto mb-2"
                          style={{ backgroundColor: siteContent.accentColor }}
                        />
                        <p className="text-sm font-medium">Accent</p>
                        <p className="text-xs text-muted-foreground">
                          {siteContent.accentColor}
                        </p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-lg border mx-auto mb-2"
                          style={{
                            backgroundColor: siteContent.backgroundColor,
                          }}
                        />
                        <p className="text-sm font-medium">Background</p>
                        <p className="text-xs text-muted-foreground">
                          {siteContent.backgroundColor}
                        </p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-lg border mx-auto mb-2"
                          style={{ backgroundColor: siteContent.textColor }}
                        />
                        <p className="text-sm font-medium">Text</p>
                        <p className="text-xs text-muted-foreground">
                          {siteContent.textColor}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSeo className="h-5 w-5" />
                        SEO Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <Input
                          id="metaTitle"
                          value={siteContent.metaTitle}
                          onChange={(e) =>
                            handleInputChange("metaTitle", e.target.value)
                          }
                          placeholder="SEO meta title"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {siteContent.metaTitle.length}/60 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="metaDescription">
                          Meta Description
                        </Label>
                        <Textarea
                          id="metaDescription"
                          value={siteContent.metaDescription}
                          onChange={(e) =>
                            handleInputChange("metaDescription", e.target.value)
                          }
                          placeholder="SEO meta description"
                          className="mt-1"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {siteContent.metaDescription.length}/160 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input
                          id="keywords"
                          placeholder="fashion, clothing, style, trends"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate keywords with commas
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="ogImage">Open Graph Image URL</Label>
                        <Input
                          id="ogImage"
                          placeholder="https://example.com/og-image.jpg"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>SEO Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-blue-600 text-lg font-medium leading-tight">
                              {siteContent.metaTitle ||
                                "Your page title will appear here"}
                            </h3>
                            <p className="text-green-700 text-sm">
                              https://joantees.com
                            </p>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {siteContent.metaDescription ||
                              "Your meta description will appear here. This is what users see in search results."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          SEO Checklist
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                siteContent.metaTitle
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span>Meta title set</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                siteContent.metaDescription
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span>Meta description set</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>HTTPS enabled</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Mobile responsive</span>
                          </div>
                        </div>
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
  );
}
