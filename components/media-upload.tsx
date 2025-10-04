"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { IconUpload, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { toast } from "sonner";

interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
  currentImageUrl?: string;
  selectedFile?: File | null;
}

export function MediaUpload({
  onFileSelect,
  currentImageUrl,
  selectedFile,
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      onFileSelect(null);
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    onFileSelect(file);
  };

  // Create preview URL for selected file
  const getPreviewUrl = () => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return currentImageUrl;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <IconUpload className="h-4 w-4" />
        Select Image
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl && (
        <div className="relative mt-2">
          <Image
            src={previewUrl}
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
            onClick={() => onFileSelect(null)}
          >
            <IconX className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
