"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

interface SingleImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  width?: number;
  height?: number;
  label?: string;
  folder?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  width = 150,
  height = 150,
  label = "Profile Picture",
  folder = "profiles",
}: SingleImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", folder);

      const res = await fetch("/api/multiple-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(getApiErrorMessage(data, "Upload failed"));

      const url = data?.uploads?.[0]?.url;
      if (url) {
        onChange(url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-muted/50"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {value ? (
          <>
            <Image
              src={value}
              alt="Profile"
              fill
              className="object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <span className="text-white text-xs font-medium">Change</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <ImageIcon size={32} />
                <span className="text-[10px] mt-1 text-center px-2">Click to upload</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
