"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconUpload, IconPhoto, IconX, IconSearch } from "@tabler/icons-react"
import Image from "next/image"
import { toast } from "sonner"

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

interface MediaUploadProps {
  onImageSelect: (imageUrl: string) => void
  currentImageUrl?: string
}

export function MediaUpload({ onImageSelect, currentImageUrl }: MediaUploadProps) {
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([
    {
      id: "1",
      name: "tshirt-white.jpg",
      url: "",
      type: "image/jpeg",
      size: 245760,
      uploadedAt: "2024-01-15"
    },
    {
      id: "2",
      name: "jeans-blue.jpg",
      url: "",
      type: "image/jpeg",
      size: 312000,
      uploadedAt: "2024-01-10"
    },
    {
      id: "3",
      name: "hoodie-gray.jpg",
      url: "",
      type: "image/jpeg",
      size: 198000,
      uploadedAt: "2024-01-20"
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB")
      return
    }

    // Create a preview URL for the uploaded image
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      
      const newMediaItem: MediaItem = {
        id: Date.now().toString(),
        name: file.name,
        url: imageUrl,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString().split('T')[0]
      }

      setMediaLibrary([...mediaLibrary, newMediaItem])
      toast.success("Image uploaded successfully!")
    }
    reader.readAsDataURL(file)
  }

  const selectImageFromMedia = (mediaItem: MediaItem) => {
    onImageSelect(mediaItem.url)
    setIsDialogOpen(false)
    toast.success("Image selected!")
  }

  const deleteMediaItem = (id: string) => {
    setMediaLibrary(mediaLibrary.filter(item => item.id !== id))
    toast.success("Media item deleted!")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredMedia = mediaLibrary.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
            >
              <IconPhoto className="h-4 w-4" />
              Choose from Media
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Media Library</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search and Upload */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <IconUpload className="h-4 w-4" />
                  Upload
                </Button>
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <div key={item.id} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-lg border bg-gray-100">
                        <Image
                          src={item.url}
                          alt={item.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => selectImageFromMedia(item)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <Button
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => selectImageFromMedia(item)}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteMediaItem(item.id)}
                      >
                        <IconX className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {filteredMedia.length === 0 && (
                  <div className="text-center py-12">
                    <IconPhoto className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No media found</h3>
                    <p className="text-muted-foreground">Upload some images to get started</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <IconUpload className="h-4 w-4" />
          Upload New
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {currentImageUrl && (
        <div className="relative mt-2">
          <Image
            src={currentImageUrl}
            alt="Preview"
            width={80}
            height={80}
            className="w-20 h-20 object-cover rounded border"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0"
            onClick={() => onImageSelect("")}
          >
            <IconX className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
} 