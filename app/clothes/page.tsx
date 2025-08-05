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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconPlus, IconEdit, IconTrash, IconShirt } from "@tabler/icons-react"

interface ClothItem {
  id: string
  title: string
  price: number
  description: string
  category: string
  imageUrl: string
}

export default function ClothesPage() {
  const [clothes, setClothes] = useState<ClothItem[]>([
    {
      id: "1",
      title: "Classic White T-Shirt",
      price: 29.99,
      description: "Premium cotton classic white t-shirt",
      category: "T-Shirts",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop"
    },
    {
      id: "2",
      title: "Denim Jeans",
      price: 89.99,
      description: "Comfortable blue denim jeans",
      category: "Jeans",
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop"
    },
    {
      id: "3",
      title: "Hoodie Sweatshirt",
      price: 59.99,
      description: "Warm and cozy hoodie",
      category: "Hoodies",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop"
    }
  ])

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    imageUrl: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCloth: ClothItem = {
      id: Date.now().toString(),
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl
    }
    setClothes([...clothes, newCloth])
    setFormData({ title: "", price: "", description: "", category: "", imageUrl: "" })
  }

  const handleDelete = (id: string) => {
    setClothes(clothes.filter(item => item.id !== id))
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
                  <h1 className="text-3xl font-bold text-foreground">Clothes Manager</h1>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-background hover:bg-primary/90">
                        <IconPlus className="h-4 w-4 mr-2" />
                        Add New Cloth
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Cloth</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                              <SelectItem value="Jeans">Jeans</SelectItem>
                              <SelectItem value="Hoodies">Hoodies</SelectItem>
                              <SelectItem value="Dresses">Dresses</SelectItem>
                              <SelectItem value="Shoes">Shoes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-primary text-background hover:bg-primary/90">
                          Add Cloth
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Clothes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clothes.map((cloth) => (
                    <Card key={cloth.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={cloth.imageUrl}
                          alt={cloth.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{cloth.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{cloth.category}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(cloth.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{cloth.description}</p>
                        <p className="text-lg font-bold text-primary">${cloth.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 