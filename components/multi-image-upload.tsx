"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconUpload, IconX, IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { toast } from "sonner";

interface MultiImageUploadProps {
  onImagesChange: (images: File[]) => void;
  onUrlsChange: (urls: string[]) => void;
  currentImages: string[];
  selectedFiles: File[];
  maxImages?: number;
}

export function MultiImageUpload({
  onImagesChange,
  onUrlsChange,
  currentImages = [],
  selectedFiles = [],
  maxImages = 5,
}: MultiImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [newUrl, setNewUrl] = useState("");

  const totalImages = currentImages.length + selectedFiles.length;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];

    for (const file of newFiles) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      if (totalImages + validFiles.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onImagesChange([...selectedFiles, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (totalImages >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Basic URL validation
    try {
      new URL(newUrl);
      onUrlsChange([...currentImages, newUrl]);
      setNewUrl("");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onImagesChange(newFiles);
  };

  const removeUrl = (index: number) => {
    const newUrls = currentImages.filter((_, i) => i !== index);
    onUrlsChange(newUrls);
  };

  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>
          Product Images ({totalImages}/{maxImages})
        </Label>
        <div className="text-sm text-muted-foreground">
          Add multiple images to showcase your product
        </div>
      </div>

      {/* Current Images Display */}
      {(currentImages.length > 0 || selectedFiles.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Existing URLs */}
          {currentImages.map((url, index) => (
            <div key={`url-${index}`} className="relative group">
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                width={120}
                height={120}
                className="w-full h-24 object-cover rounded border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeUrl(index)}
              >
                <IconX className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Selected Files */}
          {selectedFiles.map((file, index) => (
            <div key={`file-${index}`} className="relative group">
              <Image
                src={getPreviewUrl(file)}
                alt={`Selected image ${index + 1}`}
                width={120}
                height={120}
                className="w-full h-24 object-cover rounded border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <IconX className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Images Section */}
      {totalImages < maxImages && (
        <div className="space-y-3">
          {/* File Upload */}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
              disabled={totalImages >= maxImages}
            >
              <IconUpload className="h-4 w-4" />
              Select Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              ref={urlInputRef}
              placeholder="Or paste image URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddUrl}
              disabled={!newUrl.trim() || totalImages >= maxImages}
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {totalImages >= maxImages && (
        <div className="text-sm text-muted-foreground">
          Maximum {maxImages} images reached. Remove some images to add more.
        </div>
      )}
    </div>
  );
}
