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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconEdit, IconTrash, IconShirt, IconSearch, IconFilter, IconSortAscending, IconSortDescending } from "@tabler/icons-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"
import { MediaUpload } from "@/components/media-upload"
import Image from "next/image"

interface ClothItem {
  id: string
  title: string
  price: number
  description: string
  category: string
  imageUrl: string
  size?: string
  color?: string
  stock?: number
  createdAt: string
}

export default function ClothesPage() {
  const [clothes, setClothes] = useState<ClothItem[]>([
    {
      id: "1",
      title: "Classic White T-Shirt",
      price: 29.99,
      description: "Premium cotton classic white t-shirt with a comfortable fit. Perfect for everyday wear.",
      category: "T-Shirts",
      imageUrl: "",
      size: "M",
      color: "White",
      stock: 50,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      title: "Denim Jeans",
      price: 89.99,
      description: "Comfortable blue denim jeans with a modern fit. Durable and stylish for any occasion.",
      category: "Jeans",
      imageUrl: "",
      size: "32",
      color: "Blue",
      stock: 25,
      createdAt: "2024-01-10"
    },
    {
      id: "3",
      title: "Hoodie Sweatshirt",
      price: 59.99,
      description: "Warm and cozy hoodie perfect for cold weather. Made with premium materials for comfort.",
      category: "Hoodies",
      imageUrl: "",
      size: "L",
      color: "Gray",
      stock: 30,
      createdAt: "2024-01-20"
    },
    {
      id: "4",
      title: "Summer Dress",
      price: 79.99,
      description: "Elegant summer dress perfect for warm weather. Light and breathable fabric.",
      category: "Dresses",
      imageUrl: "",
      size: "S",
      color: "Floral",
      stock: 15,
      createdAt: "2024-01-25"
    },
    {
      id: "5",
      title: "Running Shoes",
      price: 129.99,
      description: "Professional running shoes with excellent cushioning and support for athletes.",
      category: "Shoes",
      imageUrl: "",
      size: "42",
      color: "Black",
      stock: 20,
      createdAt: "2024-01-30"
    }
  ])

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    imageUrl: "",
    size: "",
    color: "",
    stock: ""
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "price" | "date">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter and sort clothes
  const filteredAndSortedClothes = useMemo(() => {
    const filtered = clothes.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = a.title
          bValue = b.title
          break
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "date":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          aValue = a.title
          bValue = b.title
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [clothes, searchTerm, selectedCategory, sortBy, sortOrder])

  const categories = ["T-Shirts", "Jeans", "Hoodies", "Dresses", "Shoes", "Accessories"]
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "32", "34", "36", "38", "40", "42", "44"]
  const colors = ["White", "Black", "Blue", "Red", "Green", "Yellow", "Gray", "Brown", "Pink", "Purple", "Orange", "Floral", "Striped"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    const newCloth: ClothItem = {
      id: Date.now().toString(),
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl,
      size: formData.size || undefined,
      color: formData.color || undefined,
      stock: formData.stock ? parseInt(formData.stock) : undefined,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setClothes([...clothes, newCloth])
    setFormData({ title: "", price: "", description: "", category: "", imageUrl: "", size: "", color: "", stock: "" })
    setIsDialogOpen(false)
    toast.success("Item added successfully!")
  }

  const handleDelete = (id: string) => {
    setClothes(clothes.filter(item => item.id !== id))
    toast.success("Item deleted successfully!")
  }

  const getStockBadge = (stock?: number) => {
    if (!stock) return <Badge variant="secondary">No stock</Badge>
    if (stock <= 5) return <Badge className="bg-red-500">Low Stock ({stock})</Badge>
    if (stock <= 15) return <Badge className="bg-yellow-500">Limited ({stock})</Badge>
    return <Badge className="bg-green-500">In Stock ({stock})</Badge>
  }

  const totalValue = clothes.reduce((sum, item) => sum + (item.price * (item.stock || 0)), 0)
  const totalItems = clothes.length
  const lowStockItems = clothes.filter(item => item.stock && item.stock <= 5).length

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
                      <h1 className="text-3xl font-bold text-foreground">Clothes Manager</h1>
                      <p className="text-muted-foreground mt-1">Manage your clothing inventory</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <IconPlus className="h-4 w-4" />
                          Add New Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Clothing Item</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title *</Label>
                              <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price">Price *</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="category">Category *</Label>
                              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="size">Size</Label>
                              <Select value={formData.size} onValueChange={(value) => setFormData({...formData, size: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizes.map(size => (
                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="color">Color</Label>
                              <Select value={formData.color} onValueChange={(value) => setFormData({...formData, color: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colors.map(color => (
                                    <SelectItem key={color} value={color}>{color}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="stock">Stock Quantity</Label>
                              <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Product Image</Label>
                            <MediaUpload
                              onImageSelect={(imageUrl) => setFormData({...formData, imageUrl})}
                              currentImageUrl={formData.imageUrl}
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">Add Item</Button>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <IconShirt className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">clothing items</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <IconShirt className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">₵{totalValue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">inventory value</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <IconShirt className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-500">{lowStockItems}</div>
                        <p className="text-xs text-muted-foreground">items need restocking</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <IconFilter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={(value: "name" | "price" | "date") => setSortBy(value)}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <IconSortAscending className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
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

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedClothes.map((item) => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                target.style.display = 'none'
                                const nextElement = target.nextElementSibling as HTMLElement
                                if (nextElement) {
                                  nextElement.style.display = 'flex'
                                }
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                            <IconShirt className="h-12 w-12" />
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{item.category}</Badge>
                                {item.size && <Badge variant="secondary">{item.size}</Badge>}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-primary">₵{item.price}</span>
                            {getStockBadge(item.stock)}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <IconEdit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredAndSortedClothes.length === 0 && (
                    <div className="text-center py-12">
                      <IconShirt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No items found</h3>
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